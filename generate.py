"""Generator ruchu: prawdziwe sesje w przeglądarce (Playwright) z UTM, urządzeniami i zgodami."""
import asyncio, os, random
from playwright.async_api import async_playwright

SITE = os.environ["SITE_URL"].rstrip("/")
N = int(os.environ.get("SESSIONS", "40"))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")  # bez "HeadlessChrome" (GA4 odfiltrowuje boty)
# (utm_source, utm_medium, utm_campaign, waga, referer)
SOURCES = [
    ("google", "cpc", "kredyt_wiosna", 25, None),
    (None, None, None, 25, "https://www.google.com/"),      # organic
    ("facebook", "paid_social", "konto_mlodzi", 15, None),
    ("newsletter", "email", "promo_listopad", 10, None),
    ("porownywarka", "affiliate", "porownywarka_q4", 10, None),
    (None, None, None, 15, None),                            # direct
]
DEVICES = [None, "iPhone 13", "Pixel 7"]


async def session(p, browser):
    src = random.choices(SOURCES, weights=[s[3] for s in SOURCES])[0]
    dev = random.choices(DEVICES, weights=[50, 35, 15])[0]
    opts = dict(p.devices[dev]) if dev else dict(user_agent=UA, viewport={"width": 1366, "height": 768})
    ctx = await browser.new_context(locale="pl-PL", timezone_id="Europe/Warsaw", **opts)
    page = await ctx.new_page()
    land = random.choice(["index.html", "kredyt.html", "konto.html"])
    url = f"{SITE}/{land}"
    if src[0]:
        url += f"?utm_source={src[0]}&utm_medium={src[1]}&utm_campaign={src[2]}"
    await page.goto(url, **({"referer": src[4]} if src[4] else {}))
    await page.click("#consent-yes" if random.random() < 0.75 else "#consent-no")
    await page.wait_for_timeout(800)

    r = random.random()
    if r < 0.55:                                   # lejek kredytowy
        await page.goto(f"{SITE}/kredyt.html")
        amount = random.choice(range(5000, 200001, 5000))
        await page.evaluate("v=>{document.querySelector('#amount').value=v}", amount)
        await page.select_option("#months", random.choice(["12", "24", "48", "72"]))
        await page.click("#calc")
        if random.random() < 0.75:
            for cont in (1.0, 0.7, 0.55):          # krok1→2, 2→3, wysłanie
                if random.random() > cont:
                    break
                await page.click("#loan .step:not([hidden]) button")
                await page.wait_for_timeout(600)
    elif r < 0.8:                                  # konto
        await page.goto(f"{SITE}/konto.html")
        await page.select_option("#acctype", random.choice(["konto_osobiste", "konto_premium", "konto_mlodzi"]))
        if random.random() < 0.6:
            await page.click("#acc button")
    else:                                          # przeglądanie
        await page.click("a[href^='tel:']" if random.random() < 0.5 else "#login")
    await page.wait_for_timeout(1500)              # czas na wysłanie zdarzeń
    await ctx.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ok = 0
        for i in range(N):
            try:
                await session(p, browser)
                ok += 1
            except Exception as e:
                print("sesja", i, "błąd:", e)
            await asyncio.sleep(random.uniform(0.5, 2))
        await browser.close()
        print(f"Gotowe: {ok}/{N} sesji")

asyncio.run(main())
