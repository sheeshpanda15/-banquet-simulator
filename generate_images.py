#!/usr/bin/env python3
"""
饭局模拟器 - MiniMax 图片生成脚本
使用 MiniMax API 生成角色头像和菜品图片
"""

import base64
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests

# ==================== 配置区域 ====================
# 从环境变量读取 API Key,避免硬编码泄露
# 用法: export MINIMAX_API_KEY="sk-cp-xxx"  然后再运行脚本
API_KEY = "sk-cp-UlHRNjcZ3kSMrKXzGegfymgTYKnTE8V-1aZtS_-0NXO11zRGs3ESg3YtiMTrmO2oiWmgEGGQQhdcx_38l_PLEbP2CJPqzSTdjvfj9xtuZq8zHcF-gptQjlg"

# MiniMax 图片生成 API 地址
# - 海外版 (Key 一般是 sk-cp- 开头): https://api.minimaxi.io/v1/image_generation
# - 国内版:                            https://api.minimaxi.com/v1/image_generation
# 脚本会自动按 Key 前缀选,选错了也可以手动改这里。
def pick_api_url(key: str) -> str:
    if key.startswith("sk-cp-"):
        return "https://api.minimax.io/v1/image_generation"
    return "https://api.minimax.com/v1/image_generation"

API_URL = pick_api_url(API_KEY)

# 输出目录
OUTPUT_DIR = Path("imgs")
OUTPUT_DIR.mkdir(exist_ok=True)

# 并发数 (MiniMax 有 QPS 限制,建议 2-3)
MAX_WORKERS = 2

# 单张失败后的重试次数
MAX_RETRIES = 2

# ==================== 角色头像提示词 (11张) ====================
CHARACTER_PROMPTS = {
    "char-zhuren.jpg": """Flat illustration portrait of a 60-year-old Chinese male senior government official, in the style of contemporary Chinese satirical internet illustration, bold black outlines, flat color blocks, slightly exaggerated proportions with a large head. He has a balding combed-over hairstyle, gold-rimmed glasses, slight double chin, wearing a dark navy modern Chinese cadre-style suit buttoned up. He holds a small white porcelain wine cup in one hand with pinky raised, sitting comfortably with shoulders back. His expression is a self-satisfied half-smile with narrowed eyes, conveying expectation of being flattered. Warm reddish banquet background with soft red lanterns blurred out. Square composition. No text. Punchy color palette: deep navy, ivory, dim red, gold accents.""",

    "char-wudong.jpg": """Flat illustration portrait of a 55-year-old Chinese male business tycoon, contemporary Chinese satirical illustration style with bold black outlines and flat color blocks. He has slick-backed greasy hair, fuller prosperous face with slight ruddy complexion, wearing an expensive but loose-fitting dark suit with no tie, top buttons undone showing a thick gold chain. A heavy gold watch on his wrist is visible. He holds an expensive wine bottle with a confident grip, his other arm spread wide territorially. His expression is bored-confident, eyes half-lidded with a slight smirk—he knows he's the one being courted. Warm banquet background. Square composition. No text. Palette: dark wine, gold, ivory, deep red.""",

    "char-fuzong.jpg": """Flat illustration portrait of a 45-year-old Chinese middle manager in contemporary Chinese satirical illustration style, bold black outlines, flat colors. He has a cheap comb-over hairstyle, slight forehead sweat, wearing an off-the-rack dark gray suit that's trying too hard to look expensive. He's leaning forward eagerly, holding a wine glass aimed upward and outward as if toasting someone above him, his body language obsequiously bowed. His expression is unctuously smiling with too-eager eyes—the perfect middle-manager-sycophant. Warm banquet background. Square composition. No text. Palette: gray-brown suit, ivory, dim warm tones.""",

    "char-kezhang.jpg": """Flat illustration portrait of a 40-year-old Chinese male civil servant trying to appear cultured, contemporary Chinese satirical illustration style, bold black outlines and flat color blocks. He wears thin-rimmed scholarly glasses, neat parted hair, a slightly more refined dark suit. He holds a small wine cup with exaggerated pinky-out gesture (pretentious), eyebrow raised as if reciting poetry, faint condescending smile. His pose is theatrical—chest slightly puffed, head slightly tilted back. Warm banquet background with subtle calligraphy scroll blurred behind. Square composition. No text. Palette: forest green, charcoal, ivory.""",

    "char-xiaoLiu.jpg": """Flat illustration portrait of a 30-year-old Chinese male white-collar worker in contemporary Chinese satirical illustration style, bold black outlines and flat colors. He has neatly styled modern hair, wears a sharp navy business-casual outfit with smart watch visible, sitting upright with hands folded. His surface expression is a friendly smile but his eyes are calculating and watchful, slight smirk at one corner of his mouth—the appearance of camaraderie hiding judgment. Warm banquet background. Square composition. No text. Palette: cool navy, slate, ivory.""",

    "char-xiaoQian.jpg": """Flat illustration portrait of a 25-year-old Chinese male junior employee in contemporary Chinese satirical illustration style, bold black outlines, flat colors, slightly exaggerated big head small body proportions. He wears an ill-fitting cheap dark suit clearly too big for his thin frame, hair plastered down with too much gel, visible sweat on his forehead. He's bowing forward earnestly, holding a wine bottle in one hand ready to refill, a teapot in the other. His expression is over-the-top fawning—shining eager eyes, mouth open in adoring praise, overly bright smile. Warm banquet background. Square composition. No text. Palette: cheap blue suit, ivory, warm dim red.""",

    "char-baogong.jpg": """Flat illustration portrait of a 50-year-old Chinese male construction boss nouveau riche, contemporary Chinese satirical illustration style with bold black outlines and flat color blocks. He has a thick neck, slightly disheveled hair, red flushed face from drinking, multiple thick gold chains around his neck, large gold ring on his finger. He wears a tacky luxury-brand polo shirt with prominent logo, sleeves rolled up. He holds a cigarette in one hand and a wine cup in the other, splayed sprawling posture taking up too much space. Expression: drunken-confident, loud, gesturing with the cigarette. Warm banquet background. Square composition. No text. Palette: maroon, gold, ivory, red face.""",

    "char-laohu.jpg": """Flat illustration portrait of a 65-year-old Chinese retired teacher in contemporary Chinese satirical illustration style, bold black outlines and flat colors. He wears a slightly rumpled cardigan over a button-up shirt (informal retired-academic look), thinning gray hair tousled, face very flushed from drinking. He's mid-laughter with his mouth half-open, eyes squinted into slits, gesturing animatedly with chopsticks as if telling a story. His posture is loose and lost-his-composure-drunk. Warm banquet background. Square composition. No text. Palette: muted lavender cardigan, ivory, warm red face.""",

    "char-sijiQiang.jpg": """Flat illustration portrait of a 35-year-old Chinese male chauffeur in contemporary Chinese satirical illustration style, bold black outlines, flat colors. He wears a plain dark uniform (driver's outfit) clearly less expensive than others at the table, hands held respectfully. He holds a teacup—not wine—forced polite smile that doesn't reach his eyes, tired exhausted eyes with slight bags underneath, standing slightly outside or at edge of frame to suggest he's not equal. His posture is alert but contained. Warm banquet background. Square composition. No text. Palette: muted dark blue uniform, ivory, slate gray.""",

    "char-guanxihu.jpg": """Flat illustration portrait of a 32-year-old Chinese male nouveau-riche connected son-in-law in contemporary Chinese satirical illustration style, bold black outlines, flat colors. He wears expensive flashy luxury-brand sportswear and designer sneakers (totally inappropriate for the formal dinner), thick gold chain, AirPods or wireless earbuds visible in one ear. He's slouched in his chair scrolling through a smartphone, bored expression, doesn't even look up at the table. Slight smirk of disinterest. Warm banquet background, but he's clearly mentally elsewhere. Square composition. No text. Palette: ostentatious black-and-gold sportswear, neon accents from phone screen.""",

    "char-mishu.jpg": """Flat illustration portrait of a 27-year-old Chinese female office secretary in contemporary Chinese satirical illustration style, bold black outlines and flat colors. She wears a conservative buttoned-up professional blouse and dark blazer, hair tied back neatly in a low bun. She holds a wine glass reluctantly with both hands at chest level, body posture closed and protective with shoulders pulled slightly inward. Her gaze is directed downward and to the side, avoiding eye contact. Her expression is composed-but-tense polite professionalism barely concealing discomfort—the dignity of someone trapped by circumstance. The framing emphasizes her face and upper body professionally. Warm banquet background blurred with male figures out of focus behind her. Square composition. No text. Palette: muted lavender blouse, slate, ivory.""",
}

# ==================== 菜品提示词 (12张) ====================
DISH_PROMPTS = {
    "dish-0.jpg": """Flat illustration of a plate of Chinese cold cucumber salad (拍黄瓜), bright green cucumber slices smashed and dressed with garlic and red chili, in contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. Top-down or 45-degree view on a white round porcelain plate. Slightly exaggerated proportions, satirical edge. Warm banquet table background with red lantern light. No text. Vibrant: deep green, vermillion, garlic white.""",

    "dish-1.jpg": """Flat illustration of a luxurious bowl of sea cucumber over rice (海参捞饭), one large glistening dark sea cucumber atop a mound of white rice with rich brown sauce, in a fancy porcelain bowl. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, slightly exaggerated to emphasize ostentation. 45-degree view on banquet table. No text. Palette: dark glossy brown, ivory rice, fancy plate ornament.""",

    "dish-2.jpg": """Flat illustration of Chinese cold mung bean noodle sheets (凉拌粉皮), translucent jelly-like wide noodle strips dressed with vinegar, sesame oil, garlic, and chopped scallions, on a flat plate. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. Top-down view. No text. Palette: translucent grays, green scallion, golden sesame oil.""",

    "dish-3.jpg": """Flat illustration of a whole steamed Chinese bass fish (清蒸鲈鱼) on a long oval plate, eye open and somewhat staring at viewer (satirical touch), garnished with ginger slivers, scallion greens, and soy sauce pooling. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, slight exaggeration. The fish head clearly visible and pointing to one direction. 45-degree view. No text. Palette: silver-gray fish, green scallions, white plate, dark soy sauce.""",

    "dish-4.jpg": """Flat illustration of a giant glossy braised pork knuckle (红烧肘子) on a round porcelain plate, dark caramel-glazed skin glistening, served with greens around the base. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. Slightly absurd in size to emphasize the over-the-top nature of the dish. 45-degree view, banquet background. No text. Palette: deep caramel brown, glossy mahogany, green garnish.""",

    "dish-5.jpg": """Flat illustration of a plate of boiled large prawns (白灼大虾) arranged in a circle on a white porcelain plate, bright orange-red curled shrimp with long whiskers visible, lemon wedge in center. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. Top-down view. No text. Palette: vibrant orange-red, white plate, yellow lemon.""",

    "dish-6.jpg": """Flat illustration of Chinese sea cucumbers braised with scallions (葱烧海参), multiple dark glossy sea cucumbers arranged on a plate with cut green scallion segments and rich brown sauce. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. 45-degree view, fancy plating. No text. Palette: dark glossy brown-black, bright green scallions, brown sauce.""",

    "dish-7.jpg": """Flat illustration of a whole roasted Chinese-style chicken (招牌烧鸡) on a round plate, golden-brown crispy glistening skin, head visible and pointing to one side (important: head clearly oriented in one direction). Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, slight satirical exaggeration. The chicken feet are positioned outward toward viewer. 45-degree view. No text. Palette: golden-brown, deep amber glaze, white plate.""",

    "dish-8.jpg": """Flat illustration of an ostentatious bowl of abalone over rice (鲍鱼捞饭), one giant whole abalone with curling brown edges placed on top of a mound of white rice with rich golden-brown sauce, in a fancy ornamental bowl. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, slightly exaggerated to emphasize luxury. 45-degree view. No text. Palette: rich brown, golden sauce, ivory rice, gold-rimmed bowl.""",

    "dish-9.jpg": """Flat illustration of a small dish of Chinese vinegar-dressed peanuts (老醋花生), reddish-brown roasted peanuts scattered with chopped scallion greens and dark vinegar sauce, in a small simple shallow bowl. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, deliberately humble against the banquet luxury. Top-down view. No text. Palette: warm brown peanuts, dark vinegar, green scallion.""",

    "dish-10.jpg": """Flat illustration of a plate of Chinese dumplings (水饺) arranged in a circle, white dumpling wrappers with crimped edges, steam rising. One dumpling visibly broken open revealing a gold coin inside (招财进宝 lucky coin tradition, satirical touch). Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks. Top-down view. No text. Palette: ivory-white dumplings, gold coin shine, steam wisps.""",

    "dish-11.jpg": """Flat illustration of a vintage Maotai (Moutai) Chinese baijiu bottle (酱香白酒) presented ceremonially in the center of a banquet table, the white-glazed ceramic bottle with iconic red label and gold accents, surrounded by small white porcelain wine cups in a circle. Contemporary Chinese satirical illustration style, bold black outlines, flat color blocks, treated almost religiously like an icon (satirical edge). 45-degree view, banquet background. No text. Palette: red label, white bottle, gold accents, ivory cups, warm banquet lighting.""",
}


def call_minimax_api(prompt: str, output_filename: str, aspect_ratio: str = "1:1") -> dict:
    """
    调用 MiniMax API 生成图片并保存。

    MiniMax 实际返回结构 (image-01):
      {
        "id": "...",
        "data": {
          "image_base64": ["xxxx..."]   # 数组,n=1 时只有一个
        },
        "metadata": {...},
        "base_resp": {"status_code": 0, "status_msg": "success"}
      }
    """
    payload = {
        "model": "image-01",
        "prompt": prompt,
        "aspect_ratio": aspect_ratio,
        "response_format": "base64",
        "n": 1,
        "prompt_optimizer": True,
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    last_error = None
    for attempt in range(1, MAX_RETRIES + 2):  # 首次 + 重试
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=180)

            # HTTP 层错误
            if response.status_code != 200:
                last_error = f"HTTP {response.status_code}: {response.text[:300]}"
                # 4xx 一般是 key/参数问题,不重试;5xx 才重试
                if 400 <= response.status_code < 500:
                    break
                time.sleep(2 * attempt)
                continue

            result = response.json()

            # MiniMax 业务层错误码 (HTTP 200 但 base_resp.status_code != 0)
            base_resp = result.get("base_resp", {})
            if base_resp.get("status_code", 0) != 0:
                last_error = f"MiniMax 业务错误: {base_resp}"
                # 限流类错误重试,其他直接失败
                if base_resp.get("status_code") in (1002, 1008, 1039):  # 限流相关
                    time.sleep(3 * attempt)
                    continue
                break

            # 解析图片
            data = result.get("data") or {}
            images = data.get("image_base64") or []
            if not images:
                last_error = f"返回里没有 image_base64: {result}"
                break

            image_bytes = base64.b64decode(images[0])
            output_path = OUTPUT_DIR / output_filename
            with open(output_path, "wb") as f:
                f.write(image_bytes)

            return {"success": True, "filename": output_filename, "path": str(output_path)}

        except requests.Timeout:
            last_error = "请求超时"
            time.sleep(2 * attempt)
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"
            time.sleep(2 * attempt)

    return {"success": False, "filename": output_filename, "error": last_error or "未知错误"}


def generate_character(filename: str, prompt: str) -> dict:
    """生成角色头像 (1:1 正方形)"""
    return call_minimax_api(prompt, filename, "1:1")


def generate_dish(filename: str, prompt: str) -> dict:
    """生成菜品图片 (16:9 横版)"""
    return call_minimax_api(prompt, filename, "16:9")


def preflight_check() -> bool:
    """先用一张图试水,确认 key + 端点 + 参数都对再批量跑。"""
    print("🔍 预检: 先生成一张测试图,验证 API 通畅...")
    test_prompt = "A simple flat illustration of a red apple on a white plate, bold outlines, square composition, no text."
    r = call_minimax_api(test_prompt, "_preflight_test.jpg", "1:1")
    if r["success"]:
        print(f"  ✅ 预检通过 (测试图已保存到 {r['path']})\n")
        return True
    print(f"  ❌ 预检失败: {r['error']}")
    print("\n常见原因:")
    print("  - Key 错误或过期 → 去 MiniMax 控制台确认")
    print("  - Key 区域不对 (海外 key 用了国内域名,或反过来)")
    print("    海外 key (sk-cp-) → https://api.minimaxi.io/v1/image_generation")
    print("    国内 key          → https://api.minimaxi.com/v1/image_generation")
    print("  - 账户余额不足或未实名")
    print(f"\n当前使用的 API_URL: {API_URL}")
    return False


def main():
    print("=" * 50)
    print("饭局模拟器 - 图片生成脚本")
    print("=" * 50)

    if not API_KEY:
        print("\n❌ 没读到 API Key。请先设置环境变量:")
        print('   export MINIMAX_API_KEY="sk-cp-你的key"')
        print("   然后再运行: python generate_images.py")
        sys.exit(1)

    print(f"\n🔗 API 端点: {API_URL}")
    print(f"🔑 Key 前缀: {API_KEY[:8]}...{API_KEY[-4:]}")

    # 预检
    if not preflight_check():
        sys.exit(1)

    all_tasks = {}
    all_tasks.update(CHARACTER_PROMPTS)
    all_tasks.update(DISH_PROMPTS)

    total = len(all_tasks)
    print(f"📦 共 {total} 张图片待生成")
    print(f"   - 角色头像: {len(CHARACTER_PROMPTS)} 张 (1:1)")
    print(f"   - 菜品图片: {len(DISH_PROMPTS)} 张 (16:9)")
    print(f"   - 并发: {MAX_WORKERS}\n")

    results = []
    success_count = 0
    fail_count = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {}
        for filename, prompt in all_tasks.items():
            if filename.startswith("char-"):
                fut = executor.submit(generate_character, filename, prompt)
            else:
                fut = executor.submit(generate_dish, filename, prompt)
            futures[fut] = filename

        for i, fut in enumerate(as_completed(futures), 1):
            r = fut.result()
            results.append(r)
            if r["success"]:
                print(f"  ✅ [{i}/{total}] {r['filename']}")
                success_count += 1
            else:
                print(f"  ❌ [{i}/{total}] {r['filename']} - {r['error']}")
                fail_count += 1

    print()
    print("=" * 50)
    print("📊 生成统计")
    print("=" * 50)
    print(f"   成功: {success_count} / {total}")
    print(f"   失败: {fail_count} / {total}")
    print(f"   输出目录: {OUTPUT_DIR.absolute()}")

    if fail_count > 0:
        print("\n⚠️ 失败的文件:")
        for r in results:
            if not r["success"]:
                print(f"   - {r['filename']}: {r['error']}")
        print("\n可以直接重跑脚本,成功的图不会被重复生成 (如果你想跳过已存在的)。")
        sys.exit(1)


if __name__ == "__main__":
    main()
