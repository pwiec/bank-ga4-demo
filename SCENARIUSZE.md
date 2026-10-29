# GA4 w 3 dni – scenariusze testowe (marketing w banku)

Zdarzenia na stronie: `calculator_use`, `begin_application`, `application_step`, `generate_lead`, `application_submit`, `click_phone`, `login_click`.
Parametry: `product_type`, `loan_amount_band`, `months`, `step_number`.
Źródła ruchu: google/cpc, organic, facebook/paid_social, newsletter/email, porownywarka/affiliate, direct. Ok. 25% sesji odrzuca zgody.

## Dzień 0 (15 min) – uruchomienie
- [ ] Realtime pokazuje Twoje wejście z `?debug` na URL
- [ ] DebugView widzi `page_view`, `calculator_use`, `generate_lead` po przeklikaniu ręcznie
- [ ] Workflow *traffic* przeszedł na zielono, a po 24 h są dane w raportach

## Dzień 1 – raporty (konto demo Google + Twoja usługa)
**Konto demo (Google Merchandise Store):** analytics.google.com/analytics/web/demoAccount
1. Acquisition → Traffic acquisition: który kanał daje najwięcej przychodu? Porównaj z sesjami.
2. Explorations → Funnel: view_item → add_to_cart → begin_checkout → purchase. Gdzie największy spadek? Zrób wariant „tylko mobile”.
3. Segment „kupili ≥ 2 razy” kontra reszta: czym się różnią kanałami?
4. Path exploration od `session_start`: 3 najczęstsze ścieżki.
5. Cohort exploration: retencja tygodniowa.
**Twoja usługa (gdy są dane):**
6. Reports → Engagement → Events: czy widzisz wszystkie 7 zdarzeń?
7. Acquisition: czy kanały zgadzają się z listą powyżej? (organic ma pochodzić z referera google)
8. Tech → Device category: ok. 50% desktop, 50% mobile.

## Dzień 2 – konfiguracja
1. Admin → Events → oznacz `generate_lead` i `application_submit` jako **key events**. Sprawdź, od kiedy liczą się w raportach.
2. Admin → Custom definitions → dodaj wymiary zdarzeń: `product_type`, `loan_amount_band`, `step_number`. Pamiętaj: działają dopiero od tej chwili (bez wstecz).
3. Admin → Events → Create event: `lead_kredyt` = `generate_lead` gdzie `product_type` równa się `kredyt_gotowkowy`.
4. Admin → Data settings → Data retention: ustaw 14 miesięcy.
5. Admin → Data filters: utwórz filtr „Internal traffic” w trybie *Testing*, sprawdź go, potem ustaw jako Active (zrób to na końcu, żeby nie odciąć własnych testów).
6. Consent: porównaj liczbę użytkowników z sesji, gdzie zgoda odrzucona (Admin → Data collection → przegląd statusu Consent Mode).
7. Sprawdź w DebugView, że zdarzenie nie zawiera danych osobowych (nie wpisujemy ich do parametrów).

## Dzień 3 – analiza i raportowanie
1. **Lejek kredytowy** (Explorations → Funnel, open): `begin_application` → `application_step` (step_number=2) → `application_step` (step_number=3) → `application_submit`. Odczytaj współczynnik porzucenia na każdym kroku i podział wg `loan_amount_band`.
2. **Kanały a leady:** Reports → Acquisition → Traffic acquisition z kolumną key events. Który kanał ma najlepszy współczynnik leadów? Który największy ruch bez leadów?
3. **Atrybucja:** Advertising → Attribution → Model comparison: porównaj *Data-driven* i *Last click* dla `generate_lead`.
4. **Kampanie:** Raport z wymiarem Session campaign: `kredyt_wiosna` kontra `konto_mlodzi` (mierz współczynnik leadów, nie sesje).
5. **Looker Studio:** tabela źródeł + wykres leadów dziennie + scorecard „współczynnik leadów”.
6. **BigQuery (opcjonalnie):** Admin → Product links → BigQuery (sandbox), po dobie dane w `events_*`. Zapytanie: liczba `generate_lead` wg `traffic_source.source`.
7. Zapisz 5 wniosków dla dyrektora marketingu (np. „kanał X daje ruch, ale zero wniosków – wstrzymać budżet?”).

## Pułapki, które warto sprawdzić
- Ruch z GitHub Actions to adresy USA, więc raport Geo pokaże głównie Stany. To normalne.
- Dane w raportach standardowych pojawiają się po 24–48 h, w Realtime/DebugView od razu.
- Zmiana liczby sesji = edycja `SESSIONS` w workflow albo przy ręcznym uruchomieniu.
