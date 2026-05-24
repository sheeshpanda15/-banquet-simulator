// 增加 targetDishIdx 参数，默认为 null
const callGM = async (userAction, isNewDish = false, targetDishIdx = null) => {
  setLoading(true);
  setError(null);

  // 确定当前应该使用的真实索引
  const actualIdx = targetDishIdx !== null ? targetDishIdx : dishIdx;

  const charList = CHAR_ORDER.map(id => `* ${id}(${CHARACTERS[id].name}): ${CHARACTERS[id].persona}`).join("\n");

  const dishStart = findCurrentDishStart(history);
  const currentDishHistory = history.slice(dishStart);

  // 使用 actualIdx 替换原有的 dishIdx
  const isFirstDish = isNewDish && actualIdx === 0;

  const recentHistory = isFirstDish
    ? history.filter(h => h.type === "narration").map(h => `[场景] ${h.text}`).join("\n")
    : (isNewDish ? "" : currentDishHistory.slice(-12).map(h => {
        if (h.type === "narration") return `[场景] ${h.text}`;
        if (h.type === "event") return `[突发事件] ${h.title}: ${h.text}`;
        if (h.type === "user") return `你(小李): ${h.text}`;
        return `${CHARACTERS[h.char_id]?.name}: ${h.text}`;
      }).join("\n"));

  const mode = MODES[gameMode];
  const activeDishes = mode.dishIndices.map(i => DISHES[i]);
  const maxTurns = mode.turnsPerDish;
  const totalDishes = activeDishes.length;
  
  // 使用 actualIdx 提取当前菜品
  const currentDish = activeDishes[actualIdx];
  const orientInfo = currentDish.orientation ? `朝向: ${currentDish.orientation}(${CHARACTERS[currentDish.orientTo]?.name}位置)` : "";

  // 这里的 sysPrompt 也需要将 ${dishIdx+1} 替换为 ${actualIdx+1}
  const sysPrompt = `你是讽刺剧游戏总监...
（省略部分系统提示词保持不变）
【当前菜品】第${actualIdx+1}/${totalDishes}道: ${currentDish.name} · ${currentDish.note} ${orientInfo}
（其余内容保持完全一致）
`;