# Prometheus Enterprise — Komplette Produktspezifikation

> Moderne Management-Software für Fitness Studios, Physiotherapie-Praxen, Sportvereine & Wellness-Einrichtungen

---

## Zielgruppen

- Gyms & Fitness Studios
- Physiotherapie- & Rehabilitationspraxen
- Sportvereine & Akademien
- Yoga/Pilates Studios
- Kampfsport-Schulen
- Tanzstudios
- Schwimmschulen
- Kletterhallen
- Tennis-/Golfclubs
- Reitställe

---

## 1. Dashboard (Command Center)

| Feature | Detail |
|---------|--------|
| Mitglieder-Übersicht | Gesamtzahl, Wachstumsrate in % |
| Coach-Status | Aktive vs. inaktive Coaches |
| Umsatz MTD | Month-to-Date mit MRR-Tracking |
| Offene Zahlungen | Betrag & Anzahl überfälliger Zahlungen |
| Heutige Sessions | Live-Feed mit Status (geplant/abgeschlossen/abgesagt/no-show) |
| Alert Center | Automatische Warnungen nach Schweregrad (kritisch, Warnung, Info, Erfolg) |
| Quick Actions | Mitglied hinzufügen, Session planen, Broadcast senden, Report erstellen |

---

## 2. Mitglieder-CRM

### Datenbank
- Vollständige Mitgliederverwaltung (CRUD)
- Mitgliedschafts-Badges: Basic, Premium, VIP, Trial
- Aktivitätsstatus: Aktiv, Moderat, Inaktiv
- Zugewiesener Coach pro Mitglied
- Letzter Besuch-Tracking
- Quick Check-In Button
- QR-Code-Generierung pro Mitglied

### Notizen-System
- Prioritätsstufen: Niedrig, Mittel, Hoch
- Kategorien: Gesundheit, Persönlich, Zahlung, Sonstiges
- Ersteller- & Datumsverfolgung

### Retention-Management
- "At-Risk"-Mitglieder identifizieren (moderate/inaktive Aktivität)
- Churn-Risiko-Erkennung
- Tages-Report: Heute hinzugefügte Mitglieder mit Umsatz-Summary

### Kommunikation
- Direktnachrichten an Mitglieder
- Suchfilter: Status, Coach, Name/E-Mail

---

## 3. Coach Management

| Feature | Detail |
|---------|--------|
| Coach-Verzeichnis | Vollständige Profile mit Foto |
| Spezialisierungen | Tag-basiertes System |
| Stundensätze | Pro Coach konfigurierbar |
| Performance-Metriken | Klienten-Anzahl, Sessions/Monat, Umsatz/Monat, Bewertung (1–5 Sterne) |
| Integration Status | Verknüpfung mit Coach App (Pending, Linked, Unlinked, Error) |
| Coach-Kalender | Individuelle Kalenderansicht pro Coach |
| Detailansicht | Coach-spezifische Performance & Klientenliste |

---

## 4. Kalender & Terminplanung

- **Wochenansicht**: 7-Tage-Kalender mit Stundenslots (06:00–20:00)
- **Monatsansicht**: Monatsübersicht mit Session-Indikatoren
- **Session-Typen**: Personal Training, Gruppenklasse, Kurs, Beratung
- **Status-Tracking**: Geplant, Abgeschlossen, Abgesagt, No-Show
- **Session-Erstellung/Bearbeitung/Löschung**
- **Coach-Filter** pro Ansicht
- **Workout-Integration**: WOD/Strength-Blocks direkt in der Session-Ansicht
- **Session-Detail-Panel** mit vollständigen Informationen

---

## 5. Workout Programming

### Workout Builder
- Kategorien: Warmup, Strength, WOD, Skill, Accessory, Cooldown
- WOD-Formate: AMRAP, EMOM, For Time, Rounds, Tabata, Chipper, Custom
- Bewegungs-Bibliothek mit Equipment-Tracking
- Time Caps & Runden-Spezifikationen
- Coach-Notizen pro Bewegung
- Score-Typen: Time, Rounds+Reps, Load, Reps, Calories, Distance, Custom

### Template Management
- Wiederverwendbare Workout-Vorlagen
- Benchmark-Tracking
- Tag-basierte Organisation
- Nutzungsstatistiken

### TV-Modus
- Vollbild-Anzeige für den Gym-Floor
- Tagesansicht mit expandierbaren Sessions

---

## 6. Leaderboard & Performance Tracking

- **Workout-Ranglisten** mit Medaillen-Badges (1., 2., 3. Platz)
- **Personal Records (PRs)**: Feed mit den letzten 15 Einträgen
- **Score-Logging**: Eingabe nach Mitglied, Score-Typ, Gewicht, Zeit, Datum
- **Recent Scores Feed**: Aktivitäts-Stream (30 Einträge)
- **Mitglieder-Rankings & Teilnahme-Statistiken**

---

## 7. Zutrittskontrolle & Check-In Terminal

### 4 Check-In-Methoden

| Methode | Technologie | Detail |
|---------|-------------|--------|
| **Gesichtserkennung** | face-api.js (ML) | Echtzeit-Matching, einstellbarer Schwellenwert (Standard: 0.6), Liveness-Check |
| **Bluetooth** | Web Bluetooth API | Proximity-basiert, konfigurierbarer Radius (Standard: 10m), Geräte-Tracking |
| **QR-Code** | html5-qrcode | Token-basiert, 5 Minuten Gültigkeit, zeitbasierte Token-Generierung |
| **Manuell** | Suchfeld | Mitarbeiter-gestützte Suche & Check-In |

### Kiosk-Modus (Vollbild)
- Grosse Uhranzeige mit Datum
- Mitglied-Ergebnis-Anzeige (Erfolg/Abgelehnt/Verarbeitung)
- Mitglied-Notizen werden bei Check-In angezeigt
- PIN-geschützter Settings-Zugang

### Zugangs-Regeln
- Mitgliedschafts-Ablauf-Validierung
- Betriebszeiten-Durchsetzung
- Aktiv-Status-Überprüfung
- Feiertags-Erkennung
- Grace-Days für abgelaufene Mitgliedschaften
- Auto-Checkout nach konfigurierbarer Zeit (Standard: 120 Min.)

---

## 8. Access Logs & Sicherheit

- Vollständige Zugangsprotokoll-Historie
- **Filter**: Methode, Status (granted/denied/pending), Datumsbereich, Mitgliedername
- **Statistiken**: Gesamt-Zugangsversuche, Erfolgs-/Ablehnungsraten, Spitzenzeiten, Methoden-Verteilung
- **Live Access Monitor**: Echtzeit-Dashboard
- CSV-Export & Druckfunktion
- Terminal-Identifikation, IP-Adresse & User-Agent-Logging

---

## 9. Finanzen & Zahlungen

| Metrik | Detail |
|--------|--------|
| Umsatz MTD | Month-to-Date |
| Umsatz QTD | Quarter-to-Date |
| Umsatz YTD | Year-to-Date |
| Ausstehende Zahlungen | Anzahl & Betrag |
| Überfällige Zahlungen | Anzahl & Betrag |

### Umsatz nach Typ
- Mitgliedschaften, Personal Training, Kurse, Merchandise, Sonstiges

### Zahlungsverwaltung
- Zahlungen erstellen, bearbeiten, löschen, als bezahlt markieren
- Rechnungsnummern-Verwaltung
- Zahlungsmethoden-Tracking
- Fälligkeitsdaten-Management
- Coach-Revenue-Ranking (Top 5)

### Stripe Integration
- Connected Account Management
- Payment Processing & Intents
- Subscription Management
- Invoice Tracking
- Customer Creation/Management

---

## 10. Mitgliedschafts-Management

### Tarif-Verwaltung
- Abrechnungsintervalle: Täglich, Wöchentlich, Monatlich, Quartalsweise, Halbjährlich, Jährlich
- Setup-Gebühren
- Mindestvertragslaufzeiten
- Kündigungsfristen
- Add-ons
- Feature-Spezifikationen (Kurse, Sauna, PT-Sessions)
- Mitglieder-Kapazitätslimits

### Vertrags-Management
- Status: Ausstehend, Aktiv, Eingefroren, Gekündigt, Abgelaufen
- Auto-Renewal-Einstellungen
- Rabatt-Verwaltung
- Stripe-Subscription-Verknüpfung
- Vertragsnummern-Generierung

### Kündigung
- Kündigungsarten: Regulär, Ausserordentlich, Widerruf
- Effektives Datum, Nachweisdokument-Upload, Kündigungsgrund

### Mitgliedschaft einfrieren
- Gründe: Verletzung, Schwangerschaft, Militär, Krankheit, Umzug, Sonstiges
- Workflow: Ausstehend → Genehmigt → Aktiv → Beendet (oder Abgelehnt)
- Automatische Vertragsverlängerungs-Berechnung

### Disziplinar-System
- **Verwarnungen**: Stufe 1, 2, 3 mit Ablaufdatum & Bestätigung
- **Sperren**: Temporär oder Permanent mit Datumsbereich
- **Member Standing**: Good, Warned, Suspended, Banned

---

## 11. Standort-Analyse (Premium)

| Feature | Detail |
|---------|--------|
| Einzugsgebiet | PLZ-basierte Mitgliederverteilung mit Karte |
| Wettbewerber-Tracking | Datenbank, Standort-Mapping, Preissegment-Analyse (Budget–Luxury) |
| Expansions-Szenarien | ROI-Kalkulator, Wachstumspotenzial, Status-Tracking |
| Auslastungs-Heatmap | Spitzenzeiten-Visualisierung |
| Saisonale Muster | Besuchstrends über Monate |
| Distanz-Verteilung | Mitglieder-Entfernung vom Standort |

---

## 12. Nachrichten / Inbox

- Posteingang & Gesendet-Ordner
- Nachrichten-Composer mit Empfängerauswahl
- **Broadcast-Funktion**: Nachricht an alle Mitglieder
- Gelesen/Ungelesen-Status
- Alle als gelesen markieren
- Nachrichten löschen
- Suche nach Inhalt
- Relative Zeitanzeige

---

## 13. Analytics & Reports

- Umsatztrend-Analyse (6 Monate)
- Mitgliedschafts-Verteilung (Pie Chart)
- Aktivitätsstatus-Verteilung
- Auslastungs-/Nutzungsdaten
- Retention-Metriken
- Kurs-Besuchsmuster
- Coach-Performance-Analytics
- Mitglieder-Akquisitions-Kanäle
- Monatsvergleichs-Charts
- Visualisierungen: Bar, Line, Pie, Area Charts (Recharts)

---

## 14. Einstellungen

### Studio-Profil
- Name, E-Mail, Telefon, Adresse, Logo
- Zeitzone & Währung
- Einrichtungstyp (14 Optionen) & Kliententyp (5 Optionen)

### Team-Verwaltung
- Rollen: Owner, Admin, Manager, Coach, Receptionist
- Einladungs-System
- Profil-Management

### Zutrittskontrolle-Konfiguration
- Ein-/Ausschalten einzelner Check-In-Methoden
- Face-Match-Schwellenwert
- Liveness-Check-Anforderung
- Bluetooth-Reichweite
- Auto-Checkout-Dauer
- Betriebszeiten & Feiertage
- Benachrichtigungen bei abgelehntem Zugang

### Benachrichtigungen
- Neue Mitglieder-Anmeldungen
- Zahlungs-Alerts
- Session-Erinnerungen
- Marketing-E-Mails

### Theme
- Dark Mode / Light Mode

---

## 15. Subscription-Tiers

| Plan | Preis | Mitglieder | Staff | Features |
|------|-------|------------|-------|----------|
| **Trial** | Gratis | 100 | 3 | Alle Features, 14 Tage |
| **Basic** | $49/Monat | 100 | 3 | Kern-Features |
| **Premium** | $89/Monat | 500 | 10 | + Analytics, Coach Integration |
| **VIP** | $149/Monat | Unbegrenzt | Unbegrenzt | Alle Features, Priority Support, Custom Branding |

### Feature-Matrix

| Feature | Trial | Basic | Premium | VIP |
|---------|-------|-------|---------|-----|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Mitglieder-CRM | ✅ | ✅ | ✅ | ✅ |
| Coach Management | ✅ | ✅ | ✅ | ✅ |
| Kalender | ✅ | ✅ | ✅ | ✅ |
| Finanzen | ✅ | ✅ | ✅ | ✅ |
| Check-In Terminal | ✅ | ✅ | ✅ | ✅ |
| Nachrichten | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ❌ | ✅ | ✅ |
| Coach Integration | ✅ | ❌ | ✅ | ✅ |
| Standort-Analyse | ✅ | ❌ | ❌ | ✅ |
| Custom Branding | ✅ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ❌ | ✅ |

---

## Tech Stack

### Frontend
| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 18.3 | UI Framework |
| TypeScript | 5.8 | Type Safety |
| Vite | 5.4 | Build Tool |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui (Radix) | — | UI-Komponenten |
| Recharts | 3.6 | Datenvisualisierung |
| Lucide React | 0.462 | Icons |
| TanStack React Query | 5.83 | State & Data Fetching |

### Backend & Datenbank
| Technologie | Zweck |
|-------------|-------|
| Supabase | Backend-as-a-Service |
| PostgreSQL | Datenbank (via Supabase) |
| Row-Level Security | Datenisolierung pro Gym |
| Supabase Auth | Authentifizierung |

### AI / ML / Hardware
| Technologie | Zweck |
|-------------|-------|
| face-api.js | Gesichtserkennung (ML im Browser) |
| html5-qrcode | QR-Code-Scanning |
| qrcode.react | QR-Code-Generierung |
| Web Bluetooth API | Bluetooth Check-In |

### Zahlungen
| Technologie | Zweck |
|-------------|-------|
| Stripe | Payment Processing, Subscriptions, Invoicing |

### Testing
| Technologie | Zweck |
|-------------|-------|
| Vitest | Unit & Integration Tests |
| Testing Library | React Component Tests |

---

## Datenmodell (25+ Tabellen)

### Kern-Tabellen
- `gyms` — Studio-Informationen & Stripe-Anbindung
- `profiles` — Benutzerkonten mit Rollen
- `staff` — Mitarbeiter mit Rollenzuweisung
- `coaches` — Coach-Profile mit Spezialisierungen & Ratings
- `members` — Mitglieder mit Typ, Status, Coach-Zuweisung

### Betrieb
- `sessions` — Kurse/Sessions mit Coach, Timing, Status, Workout-Daten
- `session_participants` — Mehrfach-Teilnehmer pro Session
- `member_visits` — Check-In/Check-Out-Records
- `payments` — Zahlungen mit Status & Rechnungsnummern

### Zutrittskontrolle
- `member_face_data` — Gesichtserkennungs-Deskriptoren
- `member_bluetooth_devices` — Bluetooth-Geräte-Registry
- `access_logs` — Vollständiges Zugangs-Audit-Trail
- `gym_access_settings` — Zutrittskonfiguration

### Mitgliedschaft
- `membership_plans` — Tarif-Definitionen
- `membership_contracts` — Aktive Verträge
- `membership_addons` — Zusatzleistungen
- `membership_freezes` — Vertragspausen
- `member_warnings` — Verwarnungen
- `member_bans` — Sperren

### Kommunikation & Notizen
- `messages` — Nachrichtensystem mit Broadcast
- `member_notes` — Notizen mit Priorität & Kategorie
- `alerts` — Automatische Warnungen

### Integration
- `coach_integrations` — Coach App-Verknüpfung
- `stripe_subscriptions` — Stripe-Abonnements

---

## Sicherheit & Datenschutz

- Row-Level Security (RLS) auf allen Tabellen
- Auth-basierte Zugriffskontrolle
- Subscription-basiertes Feature Gating
- Geschützte Routen mit Auth-Check
- Demo-Modus mit localStorage-Isolierung
- Stripe Secure Payment Handling
- Face Data Verschlüsselung
- Geräte-ID-Anonymisierung
- Vollständiges Access Audit Trail

---

## Demo-Modus

- Vollständig funktionsfähiger Offline-Betrieb
- localStorage-basiert (kein Backend nötig)
- Realistische Demo-Daten vorinstalliert
- Nahtloser Wechsel zwischen Demo & Live-Betrieb
- Ideal für Präsentationen & Verkaufsgespräche

---

## Architektur-Übersicht

```
src/
├── components/        # 50+ UI-Komponenten
│   ├── Navigation/    # Sidebar, Header
│   ├── access/        # Zutrittskontrolle
│   ├── auth/          # Authentifizierung
│   ├── calendar/      # Kalender/Scheduling
│   ├── coaches/       # Coach-Management
│   ├── location/      # Standort-Analyse
│   ├── members/       # Mitglieder-CRM
│   ├── payments/      # Zahlungs-Dialoge
│   ├── settings/      # Einstellungen
│   ├── stripe/        # Stripe UI
│   ├── inbox/         # Nachrichten
│   └── dashboard/     # Dashboard-Widgets
├── contexts/          # Auth, Subscription Contexts
├── lib/               # Supabase Client, Utilities
├── pages/             # 15 Seiten-Komponenten
├── services/          # 25+ Service-Module
├── types/             # TypeScript-Definitionen
├── config/            # Tarife, Coach App Config
└── utils/             # Export/Print Utilities
```

---

*Prometheus Enterprise — Built for the modern fitness industry.*
