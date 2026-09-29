import test from "node:test";
import assert from "node:assert/strict";
import { INITIAL_CONDITION, ACTIONS, advanceCondition, conditionEnding, validateReplies, boundedNumber } from "../app/game-rules.mjs";

const neutral = { offense: "none" };
const insult = { offense: "insult", offense_quote: "你是废物" };

test("two consecutive targeted insults enter a persistent quarrel", () => {
  const first = advanceCondition(INITIAL_CONDITION, insult, "你是废物");
  assert.equal(first.mode, "dining");
  assert.equal(first.insults, 1);
  const second = advanceCondition(first, insult, "你是废物");
  assert.equal(second.mode, "quarrel");
  assert.equal(advanceCondition(second, neutral, "对不起").mode, "quarrel");
});

test("non-insulting replies reset the streak without changing body meters", () => {
  const first = advanceCondition(INITIAL_CONDITION, insult, "你是废物");
  const refusal = advanceCondition(first, neutral, "我不同意,也不喝酒");
  assert.deepEqual(refusal, INITIAL_CONDITION);
  assert.equal(advanceCondition(refusal, insult, "你是废物").mode, "dining");
});

test("unsubstantiated offense and malformed classifications are rejected", () => {
  assert.throws(() => advanceCondition(INITIAL_CONDITION, insult, "我不喝酒"));
  assert.throws(() => advanceCondition(INITIAL_CONDITION, {}, "你好"));
});

test("six explicit drinks end the game, with the final value capped at 100", () => {
  let state = INITIAL_CONDITION;
  for (let i = 0; i < 5; i++) state = advanceCondition(state, neutral, ACTIONS.drink.text, "drink");
  assert.equal(state.alcohol, 90);
  assert.equal(conditionEnding(state), null);
  state = advanceCondition(state, neutral, ACTIONS.drink.text, "drink");
  assert.equal(state.alcohol, 100);
  assert.equal(conditionEnding(state).title, "醉倒离席");
});

test("nine servings end the game independently of alcohol", () => {
  let state = INITIAL_CONDITION;
  for (let i = 0; i < 8; i++) state = advanceCondition(state, neutral, ACTIONS.eat.text, "eat");
  assert.equal(state.fullness, 96);
  assert.equal(conditionEnding(state), null);
  state = advanceCondition(state, neutral, ACTIONS.eat.text, "eat");
  assert.equal(state.alcohol, 0);
  assert.equal(conditionEnding(state).title, "撑到退席");
});

test("free text consumes only evidenced player actions", () => {
  const state = advanceCondition(INITIAL_CONDITION, {
    ...neutral, drink_units: 3, drink_quote: "连喝三杯", food_units: 1, food_quote: "吃了一份菜"
  }, "我连喝三杯,吃了一份菜");
  assert.equal(state.alcohol, 54);
  assert.equal(state.fullness, 12);
  assert.equal(advanceCondition(INITIAL_CONDITION, {
    ...neutral, drink_units: 8, drink_quote: "喝酒"
  }, "我以茶代酒").alcohol, 0);
});

test("negative, nonfinite and string consumption cannot corrupt meters", () => {
  for (const amount of [-5, NaN, Infinity, "3"]) {
    assert.equal(advanceCondition(INITIAL_CONDITION, {
      ...neutral, drink_units: amount, drink_quote: "喝酒"
    }, "喝酒").alcohol, 0);
  }
});

test("quarrel suppresses consumption in the transition and later turns", () => {
  const first = advanceCondition(INITIAL_CONDITION, insult, "你是废物");
  const next = advanceCondition(first, { ...insult, drink_units: 10, drink_quote: "喝酒" }, "你是废物,喝酒");
  assert.equal(next.mode, "quarrel");
  assert.equal(next.alcohol, 0);
  assert.equal(advanceCondition(next, neutral, ACTIONS.eat.text, "eat").fullness, 0);
});

const characters = { boss: {}, deputy: {} };
const states = { boss: { status: "在场" }, deputy: { status: "在场" } };
const replies = [
  { char_id: "boss", reply_to: "anchor", quote: "期限", text: "期限?先把材料补齐。" },
  { char_id: "deputy", reply_to: "boss", quote: "材料补齐", text: "材料补齐这事我盯着,小李你明天能交吗?" }
];

test("valid chain connects player, leader and deputy", () => {
  assert.equal(validateReplies(replies, "主任,期限是什么时候?", characters, states, "boss"), replies);
});

test("disconnected or absent replies and wrong target are rejected", () => {
  assert.throws(() => validateReplies([{ ...replies[0], text: "这菜真好吃。" }], "期限", characters, states));
  assert.throws(() => validateReplies([replies[0], { ...replies[1], reply_to: "anchor" }], "期限", characters, states));
  assert.throws(() => validateReplies(replies, "期限", characters, states, "deputy"));
  assert.throws(() => validateReplies(replies, "期限", characters, { ...states, boss: { status: "已离席" } }));
  assert.throws(() => validateReplies([], "期限", characters, states));
});

test("one-character player input still permits a direct reply", () => {
  validateReplies([{ char_id: "boss", reply_to: "anchor", quote: "嗯", text: "嗯是什么意思,说清楚。" }], "嗯", characters, states);
});

test("score deltas clamp and reject invalid numbers", () => {
  assert.equal(boundedNumber(1000, -10, 10), 10);
  assert.equal(boundedNumber(-1000, -10, 10), -10);
  assert.equal(boundedNumber(Infinity, -10, 10), 0);
  assert.equal(boundedNumber("5", -10, 10), 0);
});
