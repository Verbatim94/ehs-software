# Piano di hardening e collaborazione multi‑utente (Release 1)

## Obiettivo della fase
Portare il progetto da MVP/prototipo a **base production-ready**, mantenendo il focus sul flusso:
1. utente invia segnalazione,
2. admin autenticato la riceve,
3. admin la analizza e traccia azioni.

---

## 1) Hardening codice (ora)

### 1.1 Qualità e affidabilità del frontend
- Eliminare i `any` (store, pagine report/admin, submit summary) e introdurre tipi dominio condivisi (`Incident`, `ActionItem`, `WhyItem`, `UserRole`).
- Correggere warning/error React hooks (`useEffect` dependencies, funzioni dichiarate in ordine corretto).
- Rimuovere comportamento “finto successo” nel submit: se DB fallisce, stato UI deve restare di errore.
- Uniformare naming/status (`Open`, `In Progress`, `Resolved`, ecc.) con enum centralizzato.

**Deliverable**
- `npm run lint` senza errori bloccanti.
- Tipi condivisi in una cartella `src/types`.

### 1.2 Validazioni e UX del wizard
- Consolidare schemi Zod per step con un unico contratto finale `CreateIncidentInput`.
- Aggiungere validazioni cross-step (es. se categoria = Infortunio, campi anagrafici obbligatori).
- Migliorare messaggi di errore lato utente e stati loading/disabled consistenti.

**Deliverable**
- Wizard con validazione coerente end-to-end.
- Mapping payload -> DB tipizzato e testato.

### 1.3 Struttura codice
- Separare logica dati da UI:
  - `src/services/incidents.ts` per query Supabase,
  - hooks `useIncidents`, `useAdminDashboard`.
- Ridurre componenti troppo grandi (`Step4Analysis`, `Step5Summary`) in sottocomponenti.

**Deliverable**
- Componenti più piccoli e testabili.
- Query centralizzate e riusabili.

### 1.4 Osservabilità e error handling
- Standardizzare error logging (`console.error` -> helper unico).
- Introdurre toast/error boundary con messaggi non tecnici per utente.
- Tracciare eventi chiave (invio segnalazione, cambio stato, assegnazione admin).

**Deliverable**
- Pattern unico di gestione errori.

---

## 2) Multi‑utente e collaborazione (subito dopo hardening)

## 2.1 Modello ruoli (RBAC semplice)
Per Release 1:
- `reporter`: crea e vede solo le proprie segnalazioni.
- `admin`: vede tutte le segnalazioni del tenant/sito assegnato, aggiorna stato e analisi.
- `superadmin` (opzionale): gestisce admin e configurazioni.

Implementazione consigliata:
- tabella `profiles` collegata a `auth.users` con `role`, `site_scope`, `active`.
- uso policy RLS su `incidents` e tabelle correlate.

## 2.2 Modello dati minimo per collaborazione
Aggiungere (o verificare) tabelle:
- `incidents` (esistente, da rifinire),
- `incident_comments` (commenti admin/reporter),
- `incident_assignments` (assegnazione admin),
- `incident_activity_log` (audit trail: chi ha cambiato cosa e quando),
- `incident_attachments` (foto/file, se non già coperto).

Campi chiave suggeriti su `incidents`:
- `id`, `report_number`, `created_by`, `created_at`,
- `category`, `status`, `severity`, `site`,
- `event_summary`, `description`,
- `assigned_admin_id`,
- `submitted_at`, `closed_at`.

## 2.3 Workflow collaborazione admin
Flusso operativo:
1. Reporter invia segnalazione (stato `Submitted`).
2. Sistema notifica admin del sito.
3. Admin prende in carico (`In Review`) e può assegnarsi o riassegnare.
4. Admin compila analisi (5 Whys, cause, azioni) e imposta scadenze.
5. Chiusura (`Closed`) con commento finale e log attività.

## 2.4 Notifiche
Release 1 “leggera”:
- Inbox in-app per admin.
- Badge conteggio “nuove segnalazioni”.

Release 1.1:
- Email trigger (Supabase edge function / cron) per nuove segnalazioni e reminder scadenze.

## 2.5 Sicurezza e compliance
- RLS obbligatorio su tutte le tabelle business.
- Audit log append-only.
- Validazione server-side payload (non fidarsi solo del frontend).
- Rate limiting su submit e login.

---

## 3) Piano esecuzione (2 sprint)

## Sprint A (hardening tecnico)
- Tipizzazione completa + lint clean.
- Refactor servizi/hook.
- Correzione submit/error handling.
- Documentazione setup (`README` reale con env, schema DB, run).

**Exit criteria Sprint A**
- Zero errori lint.
- Flusso wizard->insert stabile.
- Dashboard admin legge dati con tipi forti.

## Sprint B (collaborazione admin)
- RBAC base (`profiles` + role checks).
- RLS su `incidents`.
- Assegnazione admin + activity log.
- Vista admin con filtri stato/sito/assegnatario.

**Exit criteria Sprint B**
- Admin autenticato vede/aggiorna solo dati autorizzati.
- Ogni cambio stato/assegnazione è auditabile.

---

## 4) Definizione Release 1 (prodotto)
Per la tua idea (“pagina web dove admin riceve e analizza segnalazioni”), la Release 1 è:
- Login funzionante con ruolo admin.
- Dashboard admin con lista segnalazioni ricevute.
- Apertura dettaglio segnalazione.
- Compilazione analisi e piano azioni.
- Aggiornamento stato e storico attività.

Questo è già un prodotto utile in ambiente reale, anche prima di funzioni avanzate (chat live, notifiche push, SLA complessi).
