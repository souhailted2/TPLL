--
-- PostgreSQL database dump
--

\restrict qnsJ3ADD6LAPlnQEvdg7WCPeVJYBIobJFGNj2ZIxYb9AbeQeIg8hiygzmH2iMt2

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    display_name text NOT NULL,
    permissions text[] DEFAULT '{}'::text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_days (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_id character varying NOT NULL,
    date text NOT NULL,
    check_in text,
    check_out text,
    status text DEFAULT 'absent'::text NOT NULL,
    late_minutes integer DEFAULT 0 NOT NULL,
    early_leave_minutes integer DEFAULT 0 NOT NULL,
    overtime_minutes integer DEFAULT 0 NOT NULL,
    shift_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: attendance_scans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_scans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_id character varying NOT NULL,
    scan_time timestamp without time zone DEFAULT now() NOT NULL,
    type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    phone text,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    debt_to_parent numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    is_parent boolean DEFAULT false NOT NULL,
    whatsapp_api_key text
);


--
-- Name: debt_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debt_payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    debt_id character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: external_debts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_debts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    person_name text NOT NULL,
    phone text,
    total_amount numeric(15,2) NOT NULL,
    paid_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: external_funds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_funds (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    person_name text NOT NULL,
    phone text,
    amount numeric(15,2) NOT NULL,
    type text DEFAULT 'incoming'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: factory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factory_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    date text NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: machine_daily_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machine_daily_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    machine_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    output_value numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    old_counter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    new_counter numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: machines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.machines (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    workshop_id character varying NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'counter'::text NOT NULL,
    expected_daily_output numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: member_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_transfers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    member_id character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: member_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text,
    type_id character varying NOT NULL,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operators (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: project_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    project_id character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    type text DEFAULT 'income'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: raw_material_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.raw_material_purchases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    raw_material_id character varying NOT NULL,
    quantity numeric(15,2) NOT NULL,
    cost numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: raw_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.raw_materials (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    quantity numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    workshop_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: spare_parts_consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_parts_consumption (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    spare_part_id character varying NOT NULL,
    machine_id character varying NOT NULL,
    quantity numeric(15,2) NOT NULL,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: spare_parts_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_parts_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    quantity numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    unit text DEFAULT 'قطعة'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: spare_parts_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.spare_parts_purchases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    spare_part_id character varying NOT NULL,
    quantity numeric(15,2) NOT NULL,
    cost numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transfers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    from_company_id character varying NOT NULL,
    to_company_id character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: truck_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.truck_expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    truck_id character varying NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) NOT NULL,
    type text DEFAULT 'expense'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    date text
);


--
-- Name: truck_trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.truck_trips (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    truck_id character varying NOT NULL,
    departure_location text NOT NULL,
    arrival_location text NOT NULL,
    fuel_expense numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    food_expense numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    spare_parts_expense numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    old_odometer numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    new_odometer numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    trip_fare numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    expected_fuel numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    net_result numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    driver_wage_entry numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    commission_entry numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    date text
);


--
-- Name: trucks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trucks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    number text NOT NULL,
    driver_name text NOT NULL,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    fuel_formula numeric(15,4) DEFAULT '0'::numeric NOT NULL,
    driver_wage numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    driver_commission_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: work_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_shifts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    late_tolerance_minutes integer DEFAULT 3 NOT NULL,
    early_leave_minutes integer DEFAULT 10 NOT NULL,
    overtime_after_minutes integer DEFAULT 30 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: worker_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: worker_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_id character varying NOT NULL,
    type text NOT NULL,
    amount numeric(15,2) NOT NULL,
    note text,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: worker_warnings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_warnings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_id character varying NOT NULL,
    date text NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    worker_number text,
    worker_company_id character varying,
    contract_end_date text,
    wage numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    work_period text,
    workshop_id character varying,
    non_renewal_date text,
    balance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    overtime_rate numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    shift_id character varying,
    bonus numeric(15,2) DEFAULT '5000'::numeric NOT NULL
);


--
-- Name: workshop_expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_expense_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


--
-- Name: workshop_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    workshop_id character varying NOT NULL,
    category text NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshops (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_users (id, username, password, display_name, permissions, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: attendance_days; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_days (id, worker_id, date, check_in, check_out, status, late_minutes, early_leave_minutes, overtime_minutes, shift_id, created_at) FROM stdin;
e4dcb3e1-3e4f-4c3c-9b4a-9d2421ac1bac	29c904cd-7ddb-468e-840d-91d886d89dcc	2026-02-24	00:31	\N	present	0	0	0	\N	2026-02-24 00:31:52.294704
\.


--
-- Data for Name: attendance_scans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_scans (id, worker_id, scan_time, type, created_at) FROM stdin;
7cfd865c-05ba-499a-9031-1720572e6489	29c904cd-7ddb-468e-840d-91d886d89dcc	2026-02-24 00:31:52.286	in	2026-02-24 00:31:52.289471
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, username, password, phone, balance, debt_to_parent, is_parent, whatsapp_api_key) FROM stdin;
4ec2d362-e358-4ae5-924c-d9c04c605774	شركة النور للتجارة	alnoor	$2b$10$la6/79Qx/3vBvXfiXHI0zuODTmL/7WKT5HYWz7ns6wDr5.DcuAkk6	966501111111	25000.00	-5000.00	f	\N
4af9f370-a743-4ed1-8a80-335906149d64	شركة الأمل للمقاولات	alamal	$2b$10$uCq3fOnw3.WP7dorjtAT1u5XsTzDrGQu4poom8YhavCRP6E/UBFYC	966502222222	18000.00	5000.00	f	\N
29c32ba3-4988-46f1-bc49-4188f0ab8c52	شركة الرياض للتقنية	alriyadh	$2b$10$SnQfdaPwrLb7lODfhmFNr.no6CxGT4hJIYPXgnHlEC/JR1tFcsxGe	966503333333	32000.00	-8500.00	f	\N
c0567f28-be91-4ab6-938a-ee0813f5178f	شركة الخليج للاستثمار	alkhaleej	$2b$10$kFnCsFimshOtEXRvWhmV5.LsvAKOree28lw0ah0TLWSucrafgxce2	966504444444	45000.00	8500.00	f	\N
47e5e976-5573-45bb-9b0d-1c1c24ef784d	شركة جديدة	newcompany	$2b$10$urJOR8BoA4Y5HTu3j.8PIuNN.BmucpPTOOYmJ6c1e.U1/nskTpaoG	966555000000	0.00	0.00	f	\N
df5bee66-0e27-4bb6-93af-f4b107d4cd91	الشركة الأم المركزية	admin	$2b$10$0IWNTjr.plDlyeiWx.fOyOdZopVAzo.Wlrdo9PijtQDZIC0BuSJZ2	00213555053058	-4167314.00	0.00	t	\N
\.


--
-- Data for Name: debt_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.debt_payments (id, debt_id, amount, note, created_at, date) FROM stdin;
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_categories (id, name) FROM stdin;
d8c60527-3fbc-4dd8-93e7-a53d41fa1fb1	مصاريف المصنع
206dd43c-1218-4f38-aa79-1a28a2edd531	مصاريف العمال
2b1aaa12-2169-4a52-ba9e-20ed7b43d1f6	مصاريف أخرى
0f15e28f-def7-490b-9309-cd52172f39ef	مصاريف النقل
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, category, amount, description, created_at, date) FROM stdin;
00a4b35f-2046-45d1-b7b3-585cbe103c6c	d8c60527-3fbc-4dd8-93e7-a53d41fa1fb1	999.00	مواد خام	2026-02-17 09:04:17.327524	
\.


--
-- Data for Name: external_debts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_debts (id, person_name, phone, total_amount, paid_amount, note, created_at, date) FROM stdin;
\.


--
-- Data for Name: external_funds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.external_funds (id, person_name, phone, amount, type, description, created_at, date) FROM stdin;
25a0351f-fd6f-4cfc-ba23-3ca7e379baf4	أحمد محمد	\N	10000.00	incoming	إيراد خارجي تجريبي	2026-02-17 21:22:49.472313	\N
72de2117-387b-487c-81be-1c1cecace552	سعيد علي	\N	3000.00	outgoing	\N	2026-02-17 21:23:32.368379	\N
4b91f2ae-cf0c-4e71-99e6-2f7b05e66eb2	تجربة إيجابية	\N	5000.00	incoming	\N	2026-02-19 07:45:57.955185	\N
\.


--
-- Data for Name: factory_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.factory_settings (id, balance) FROM stdin;
44bea2cd-1620-44fa-acd2-1a1a4f0c15f6	5500.00
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, date, name, created_at) FROM stdin;
2e1e6f38-9a10-466b-ab34-d96f34c1c200	2026-03-01	عيد الاستقلال	2026-02-24 00:31:24.825792
\.


--
-- Data for Name: machine_daily_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.machine_daily_entries (id, machine_id, worker_id, output_value, old_counter, new_counter, date, created_at) FROM stdin;
\.


--
-- Data for Name: machines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.machines (id, workshop_id, name, type, expected_daily_output, unit, created_at) FROM stdin;
\.


--
-- Data for Name: member_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_transfers (id, member_id, amount, note, created_at, date) FROM stdin;
5869ec6f-4259-40fe-9e3b-9616f24c9f7c	e379383e-1df6-41a6-ad5d-aa1e79cfd48c	5000.00	راتب شهري	2026-02-17 09:50:59.771413	\N
\.


--
-- Data for Name: member_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_types (id, name) FROM stdin;
320fc3b7-1c21-4ae2-afb6-9081c08f48df	موظف
53f4856d-d1c0-49a8-b794-2801e6cbf14c	مقاول
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, name, phone, type_id, balance) FROM stdin;
e379383e-1df6-41a6-ad5d-aa1e79cfd48c	أحمد محمد	213555111222	320fc3b7-1c21-4ae2-afb6-9081c08f48df	5000.00
\.


--
-- Data for Name: operators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.operators (id, name, username, password, created_at) FROM stdin;
ceae1a46-eb21-4565-aeb7-1a4b5cf2a784	مشغّل تجريبي	testop_l7Qg2X	$2b$10$w4p8VJl7i0bV/CEqA0gLM.7dieXvwSdwvsD0RazAuW8Zvoun8FDdu	2026-02-19 12:16:52.556226
12abeaf6-b6b5-405a-bfed-0e02b867c2a3	مسؤول الشاحنات	agent1	$2b$10$eWRWtO1Gmg2UUtSRqD9YMuRwy/j.XZ8Cyuble2U44nDUQnN/1TS5.	2026-02-19 12:45:15.100497
\.


--
-- Data for Name: project_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_transactions (id, project_id, amount, type, description, created_at, date) FROM stdin;
bb36f7c8-6f7a-4a48-9639-fee80e1c1207	3d2ce322-3a97-4b4b-b2c2-9218400dad1a	4000000.00	expense	\N	2026-02-19 12:59:38.795287	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, name, description, balance, created_at) FROM stdin;
3d2ce322-3a97-4b4b-b2c2-9218400dad1a	zemla	\N	-4000000.00	2026-02-19 12:59:20.146691
\.


--
-- Data for Name: raw_material_purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.raw_material_purchases (id, raw_material_id, quantity, cost, date, created_at) FROM stdin;
\.


--
-- Data for Name: raw_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.raw_materials (id, name, quantity, unit, workshop_id, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
N0yG7HhCOatRyiwpR567LVXHHnToSeFo	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T07:42:41.574Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 07:42:42
nqbLklJJxkpmIvzrC8SzaTWCcmUIHLY7	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T07:42:46.430Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 07:42:47
VOL7xR31pzSKppcYpfIeE2oFmL9KZfBZ	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:13.424Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:14
Y2ApEKYfPqIPKYDBSBBoYUYZSHDoKeUo	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:16.011Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:17
jOutLeSFOOJIaMINOdjyUpyTUxkQ0Nq-	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:16.824Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:17
8HjHf6WEpxnWzrGJxPmWKbuFaFdK2Wpe	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T07:43:19.671Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 07:43:27
dGBKLzAwfdC9XwKRDggfO5jKHUtw5xMe	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:17.629Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:18
1YUvAuOUQigA0TGZ9sXLvIDT8-LlTcl5	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T09:19:21.599Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 09:20:48
MM1GWJzGf2dlYDwXhjZ0G6EmFFAJ0NFh	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:17.956Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:18
Xv2ovXaTU19i-UW-SGsQEMq97XxWXN3t	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:18.408Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:19
DJX1chtLl8QF0ZJchKly9PvsdLp9ut-v	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T11:19:19.239Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 11:19:20
iUruxCNBeJBnXa3VHJMFqoXMglA0xOAr	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:29:05.826Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:29:06
8WyWUnQHoTvycuFhqK7n8Sr0m7HqddH2	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:32:08.316Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:32:09
ewe5VPh0Hj2_IzcX0wVPGLFSIr1iTULj	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:32:09.251Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:32:10
mfEzYBTDlEV7WTIb1IWvuHsrUF-A5OuD	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:32:10.202Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:32:11
r5e7AZj4G03SJnCTQqor9Liw2yHr4JIx	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:41:54.973Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:41:55
c-xS_CuafOkfEernaXAYjUPAIeemofJi	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-02T23:38:17.120Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-03-02 23:38:18
GkgKUHIVdOe2osoCG5nCX8GBGUYdrqeH	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T13:04:10.428Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 13:05:59
tHdZb70yGeKWxHtZNxBhyMVgflX-vpo7	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T13:42:41.973Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 13:44:52
iKLdhLFJccEhMVDt3WLAZkbyQ9ML-fbA	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-25T09:34:38.471Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-25 12:12:14
fdvDGsMIwdS6aaWDfLycBafHl7FdLhL9	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:29:25.026Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:29:26
AJY5WvQMutgN9oxYrT08-FWWD_PcFLiF	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:35:01.742Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:35:02
zaey78NBk73kKAPJDqVfXNe-vWnu_gIa	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T16:09:29.479Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 16:10:57
gIuiNY1oGiUcXZpjX3JKck6aCI_cH_OB	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T07:44:09.084Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91"}	2026-02-26 07:45:59
SwNtV9OCAcURCQU-dDPxCz0NPGUc2kqx	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:47.452Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:30:48
pziuqEW_CrYcGqkGsqbkq5gxTrWBsh7L	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:50.942Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:30:51
Ou6vaKssEjXaciyObju0guWzV_xYQNC6	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:51.766Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:30:52
TmKbSKxtwKw2dC9oG2CfKLzpLZ5-qLXy	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:52.534Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:30:53
nJ9aHHbHnVTm1fLpC7P5zz_fBn8XsQmv	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:54.094Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:30:55
oBki1UeIyeV3U6pka3xHv9MYVCZaZ4V5	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:30:59.635Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:31:00
rDJLJsfKhJfvFCgo-jS3ew1pVG1a9ciK	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T18:55:01.917Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 18:55:10
W_B43DDIXHQJAM9jCUJfoK87UB6HFRja	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T16:05:20.906Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 16:06:44
9Cl-zwojAmtb4osBs5CF_fzD-HbtGafT	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:47:34.868Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-03-04 00:34:27
9HL_51g3zKxtG-mMuGlquOnUcL4ufJ17	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T23:52:10.329Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 23:52:50
n2pSya1N3eg8KNpqX1Sx8WXP3hkV2-gm	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T14:38:37.342Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 14:40:33
MPA2I5YShBKVYLKfSEm4LWmwR0EXQ1zZ	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-02T23:40:49.977Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-03-02 23:43:29
MXURlSUTV-OK5Ndg1aX1zoESO08UAzS5	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:31:12.166Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:31:13
irFT7u7LmLH-PZ9OW6d4X8joJbT_xhha	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-03T00:13:57.584Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-03-03 00:15:37
7YMt1cTyTxpNS-bDhsa7mme_BQ7oAE_j	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-28T17:29:36.111Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-28 17:30:09
DXlAYs-SJUP9RhqIQGUXPYDonT74lec3	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T23:31:57.764Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 23:32:18
bv4BIggeoMQGKKk0fF1-ZtIY2GvR8D3I	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:31:38.900Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:31:39
fjDkSpy4l-jctMCRvKftd6h9Ks0_bKV3	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:31:41.758Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:31:42
eEXAMDxaatNkZMmr7KoLpirIiMAHndQ7	{"cookie": {"path": "/", "secure": true, "expires": "2026-03-03T00:30:08.004Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-03-03 00:32:30
LKJzTkvb7it-5h5W69EWLQyHeC8p4ZNj	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-26T12:31:59.474Z", "httpOnly": true, "originalMaxAge": 604800000}, "isParent": true, "companyId": "df5bee66-0e27-4bb6-93af-f4b107d4cd91", "operatorId": null}	2026-02-26 12:35:07
\.


--
-- Data for Name: spare_parts_consumption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spare_parts_consumption (id, spare_part_id, machine_id, quantity, date, created_at) FROM stdin;
\.


--
-- Data for Name: spare_parts_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spare_parts_items (id, name, quantity, unit, created_at) FROM stdin;
d43d75b8-ad30-4f58-a299-612bc86c3287	قطعة اختبار LrIh	0.00	قطعة	2026-02-19 14:40:13.445465
\.


--
-- Data for Name: spare_parts_purchases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spare_parts_purchases (id, spare_part_id, quantity, cost, date, created_at) FROM stdin;
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transfers (id, from_company_id, to_company_id, amount, status, note, created_at, date) FROM stdin;
dc475ab9-8f70-485b-8a5c-576072f916e0	4ec2d362-e358-4ae5-924c-d9c04c605774	4af9f370-a743-4ed1-8a80-335906149d64	5000.00	approved	دفعة مستحقة عن عقد توريد	2026-02-16 18:41:28.823379	\N
048a7515-12d7-472c-b1cb-d9f393792d9b	29c32ba3-4988-46f1-bc49-4188f0ab8c52	c0567f28-be91-4ab6-938a-ee0813f5178f	8500.00	approved	سداد فاتورة خدمات	2026-02-16 18:41:28.823379	\N
f6a3f14f-db2b-43ec-8e09-2bef429302d2	29c32ba3-4988-46f1-bc49-4188f0ab8c52	4ec2d362-e358-4ae5-924c-d9c04c605774	12000.00	pending	تحويل ربع سنوي	2026-02-16 18:41:28.823379	\N
843aeb1d-05ed-41ba-92ba-51fe80e30c00	c0567f28-be91-4ab6-938a-ee0813f5178f	29c32ba3-4988-46f1-bc49-4188f0ab8c52	3000.00	rejected	تحويل تجريبي	2026-02-16 18:41:28.823379	\N
7c5674ca-1820-4c6b-baa8-9bcf0dd354c9	4ec2d362-e358-4ae5-924c-d9c04c605774	c0567f28-be91-4ab6-938a-ee0813f5178f	15000.00	pending	دفعة استثمارية	2026-02-16 18:41:28.823379	\N
1bda49e1-043d-4de7-b951-48898bc1a3a9	df5bee66-0e27-4bb6-93af-f4b107d4cd91	4ec2d362-e358-4ae5-924c-d9c04c605774	1000.00	pending	تحويل تجريبي	2026-02-17 09:23:15.782708	\N
b7d1424f-3b4b-4f50-8e1a-903029f39f59	4ec2d362-e358-4ae5-924c-d9c04c605774	df5bee66-0e27-4bb6-93af-f4b107d4cd91	500.00	pending	تحويل من شركة فرعية	2026-02-17 09:26:26.624093	\N
\.


--
-- Data for Name: truck_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.truck_expenses (id, truck_id, category, amount, type, description, created_at, date) FROM stdin;
cca56bb4-273c-4883-a495-61ceae94ba24	4aeadd10-3796-4ce2-b1e2-e3162fb36932	بنزين	5000.00	expense	بنزين تجريبي	2026-02-17 21:12:08.875469	\N
27fc0bf2-5953-4972-b5cd-dbdff04c530e	7ce28261-fcb6-417c-924c-6eb990697f42	عمولة السائق	1100.00	expense	\N	2026-02-19 13:44:26.695167	\N
\.


--
-- Data for Name: truck_trips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.truck_trips (id, truck_id, departure_location, arrival_location, fuel_expense, food_expense, spare_parts_expense, old_odometer, new_odometer, trip_fare, expected_fuel, net_result, created_at, driver_wage_entry, commission_entry, date) FROM stdin;
5ce17031-d2b0-411f-8caa-879a67dc44ad	4aeadd10-3796-4ce2-b1e2-e3162fb36932	eloued	alger	6300.00	1500.00	0.00	6500.00	7200.00	25000.00	0.00	17200.00	2026-02-19 12:22:41.6549	0.00	0.00	\N
fb2e290d-4724-472a-94f3-d4f2fe6ce5f0	4aeadd10-3796-4ce2-b1e2-e3162fb36932	alger	eloued	12000.00	2500.00	0.00	7200.00	8200.00	45000.00	0.00	30500.00	2026-02-19 12:25:05.584702	0.00	0.00	\N
5e98a200-faa8-4e14-8766-9d2eb781bb79	4aeadd10-3796-4ce2-b1e2-e3162fb36932	alger	eloued	15000.00	1500.00	0.00	8200.00	9200.00	0.00	860.00	-16500.00	2026-02-19 12:37:03.218831	0.00	0.00	\N
40580217-6fea-43c6-b2ec-56d92219deaf	4aeadd10-3796-4ce2-b1e2-e3162fb36932	oran	alger	9800.00	1500.00	15.00	9200.00	10200.00	45000.00	860.00	33685.00	2026-02-19 12:46:34.479831	0.00	0.00	\N
675cd3b1-56d6-4dc5-a8f2-b3cca6f1ab84	0303e638-c185-492e-91e0-4781799e1e09	الجزائر	وهران	1500.00	200.00	100.00	1000.00	1500.00	6000.00	1000.00	3400.00	2026-02-19 13:05:40.326134	500.00	300.00	\N
8cd14336-1147-430a-a0cd-e960fe18cffb	7ce28261-fcb6-417c-924c-6eb990697f42	الجزائر	وهران	3000.00	500.00	500.00	0.00	500.00	20000.00	1000.00	16000.00	2026-02-19 13:43:57.879851	0.00	0.00	\N
\.


--
-- Data for Name: trucks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trucks (id, number, driver_name, balance, fuel_formula, driver_wage, driver_commission_rate) FROM stdin;
4aeadd10-3796-4ce2-b1e2-e3162fb36932	TEST123	سائق تجريبي	59885.00	0.8600	50000.00	10.00
0303e638-c185-492e-91e0-4781799e1e09	TEST-VFzF	سائق تجريبي	3400.00	2.0000	0.00	0.00
7ce28261-fcb6-417c-924c-6eb990697f42	STMT-xuP-	سائق كشف	14900.00	2.0000	5000.00	10.00
\.


--
-- Data for Name: work_shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_shifts (id, name, start_time, end_time, late_tolerance_minutes, early_leave_minutes, overtime_after_minutes, created_at) FROM stdin;
6bd11304-4dbb-4021-9492-1651ee3714bb	وردية صباحية	08:00	16:00	3	10	30	2026-02-24 00:30:58.673531
\.


--
-- Data for Name: worker_companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_companies (id, name, created_at) FROM stdin;
fac2ed0c-d901-479a-b6b1-15a1432bd179	شركة النقل	2026-02-23 23:41:13.921175
\.


--
-- Data for Name: worker_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_transactions (id, worker_id, type, amount, note, date, created_at) FROM stdin;
4722fa51-2636-4769-979f-0dd1bdd1e520	29c904cd-7ddb-468e-840d-91d886d89dcc	salary	25000.00	أجرة شهر يناير	2026-02-23	2026-02-23 23:43:10.127104
da6d33af-c4f0-4941-b2de-d8e097fc09a3	29c904cd-7ddb-468e-840d-91d886d89dcc	advance	5000.00	سلفة	2026-02-23	2026-02-23 23:43:28.128952
65c4e391-78fc-4eca-986c-9a23189626b7	16a13f72-8424-418d-8023-c6c2513b1d71	salary	250000.00	\N	2026-02-24	2026-02-24 00:15:09.562744
b7b144ea-b205-4f58-ab51-8ba920ba5649	16a13f72-8424-418d-8023-c6c2513b1d71	deduction	15000.00	استخلاص دين	2026-02-24	2026-02-24 00:15:36.419145
\.


--
-- Data for Name: worker_warnings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_warnings (id, worker_id, date, reason, created_at) FROM stdin;
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workers (id, name, phone, created_at, worker_number, worker_company_id, contract_end_date, wage, work_period, workshop_id, non_renewal_date, balance, overtime_rate, shift_id, bonus) FROM stdin;
29c904cd-7ddb-468e-840d-91d886d89dcc	أحمد محمد	0555123456	2026-02-23 23:42:28.483738	W001	fac2ed0c-d901-479a-b6b1-15a1432bd179	2026-04-24	50000.00	\N	\N	\N	30000.00	0.00	\N	5000.00
16a13f72-8424-418d-8023-c6c2513b1d71	عامل اختبار EOd-	\N	2026-02-19 14:39:44.259075	\N	\N	\N	0.00	\N	\N	\N	235000.00	0.00	\N	5000.00
\.


--
-- Data for Name: workshop_expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workshop_expense_categories (id, name) FROM stdin;
\.


--
-- Data for Name: workshop_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workshop_expenses (id, workshop_id, category, amount, description, date, created_at) FROM stdin;
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workshops (id, name, created_at) FROM stdin;
a47c40f4-bbc6-4612-9f3e-b436920c9e88	ورشة اختبار M5kL	2026-02-19 14:39:05.153505
\.


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_unique UNIQUE (username);


--
-- Name: attendance_days attendance_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_days
    ADD CONSTRAINT attendance_days_pkey PRIMARY KEY (id);


--
-- Name: attendance_scans attendance_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_scans
    ADD CONSTRAINT attendance_scans_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_username_unique UNIQUE (username);


--
-- Name: debt_payments debt_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: external_debts external_debts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_debts
    ADD CONSTRAINT external_debts_pkey PRIMARY KEY (id);


--
-- Name: external_funds external_funds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_funds
    ADD CONSTRAINT external_funds_pkey PRIMARY KEY (id);


--
-- Name: factory_settings factory_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factory_settings
    ADD CONSTRAINT factory_settings_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: machine_daily_entries machine_daily_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_daily_entries
    ADD CONSTRAINT machine_daily_entries_pkey PRIMARY KEY (id);


--
-- Name: machines machines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);


--
-- Name: member_transfers member_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_transfers
    ADD CONSTRAINT member_transfers_pkey PRIMARY KEY (id);


--
-- Name: member_types member_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (id);


--
-- Name: operators operators_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_username_unique UNIQUE (username);


--
-- Name: project_transactions project_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_transactions
    ADD CONSTRAINT project_transactions_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: raw_material_purchases raw_material_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raw_material_purchases
    ADD CONSTRAINT raw_material_purchases_pkey PRIMARY KEY (id);


--
-- Name: raw_materials raw_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raw_materials
    ADD CONSTRAINT raw_materials_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: spare_parts_consumption spare_parts_consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_consumption
    ADD CONSTRAINT spare_parts_consumption_pkey PRIMARY KEY (id);


--
-- Name: spare_parts_items spare_parts_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_items
    ADD CONSTRAINT spare_parts_items_pkey PRIMARY KEY (id);


--
-- Name: spare_parts_purchases spare_parts_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_purchases
    ADD CONSTRAINT spare_parts_purchases_pkey PRIMARY KEY (id);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: truck_expenses truck_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.truck_expenses
    ADD CONSTRAINT truck_expenses_pkey PRIMARY KEY (id);


--
-- Name: truck_trips truck_trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.truck_trips
    ADD CONSTRAINT truck_trips_pkey PRIMARY KEY (id);


--
-- Name: trucks trucks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trucks
    ADD CONSTRAINT trucks_pkey PRIMARY KEY (id);


--
-- Name: work_shifts work_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_shifts
    ADD CONSTRAINT work_shifts_pkey PRIMARY KEY (id);


--
-- Name: worker_companies worker_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_companies
    ADD CONSTRAINT worker_companies_pkey PRIMARY KEY (id);


--
-- Name: worker_transactions worker_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_transactions
    ADD CONSTRAINT worker_transactions_pkey PRIMARY KEY (id);


--
-- Name: worker_warnings worker_warnings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_warnings
    ADD CONSTRAINT worker_warnings_pkey PRIMARY KEY (id);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: workshop_expense_categories workshop_expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_expense_categories
    ADD CONSTRAINT workshop_expense_categories_pkey PRIMARY KEY (id);


--
-- Name: workshop_expenses workshop_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_expenses
    ADD CONSTRAINT workshop_expenses_pkey PRIMARY KEY (id);


--
-- Name: workshops workshops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT workshops_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: attendance_days attendance_days_shift_id_work_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_days
    ADD CONSTRAINT attendance_days_shift_id_work_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.work_shifts(id);


--
-- Name: attendance_days attendance_days_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_days
    ADD CONSTRAINT attendance_days_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: attendance_scans attendance_scans_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_scans
    ADD CONSTRAINT attendance_scans_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: debt_payments debt_payments_debt_id_external_debts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_external_debts_id_fk FOREIGN KEY (debt_id) REFERENCES public.external_debts(id);


--
-- Name: machine_daily_entries machine_daily_entries_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_daily_entries
    ADD CONSTRAINT machine_daily_entries_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: machine_daily_entries machine_daily_entries_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machine_daily_entries
    ADD CONSTRAINT machine_daily_entries_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: machines machines_workshop_id_workshops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_workshop_id_workshops_id_fk FOREIGN KEY (workshop_id) REFERENCES public.workshops(id);


--
-- Name: member_transfers member_transfers_member_id_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_transfers
    ADD CONSTRAINT member_transfers_member_id_members_id_fk FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: members members_type_id_member_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_type_id_member_types_id_fk FOREIGN KEY (type_id) REFERENCES public.member_types(id);


--
-- Name: project_transactions project_transactions_project_id_projects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_transactions
    ADD CONSTRAINT project_transactions_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: raw_material_purchases raw_material_purchases_raw_material_id_raw_materials_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raw_material_purchases
    ADD CONSTRAINT raw_material_purchases_raw_material_id_raw_materials_id_fk FOREIGN KEY (raw_material_id) REFERENCES public.raw_materials(id);


--
-- Name: raw_materials raw_materials_workshop_id_workshops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.raw_materials
    ADD CONSTRAINT raw_materials_workshop_id_workshops_id_fk FOREIGN KEY (workshop_id) REFERENCES public.workshops(id);


--
-- Name: spare_parts_consumption spare_parts_consumption_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_consumption
    ADD CONSTRAINT spare_parts_consumption_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: spare_parts_consumption spare_parts_consumption_spare_part_id_spare_parts_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_consumption
    ADD CONSTRAINT spare_parts_consumption_spare_part_id_spare_parts_items_id_fk FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts_items(id);


--
-- Name: spare_parts_purchases spare_parts_purchases_spare_part_id_spare_parts_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spare_parts_purchases
    ADD CONSTRAINT spare_parts_purchases_spare_part_id_spare_parts_items_id_fk FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts_items(id);


--
-- Name: transfers transfers_from_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_from_company_id_companies_id_fk FOREIGN KEY (from_company_id) REFERENCES public.companies(id);


--
-- Name: transfers transfers_to_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_to_company_id_companies_id_fk FOREIGN KEY (to_company_id) REFERENCES public.companies(id);


--
-- Name: truck_expenses truck_expenses_truck_id_trucks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.truck_expenses
    ADD CONSTRAINT truck_expenses_truck_id_trucks_id_fk FOREIGN KEY (truck_id) REFERENCES public.trucks(id);


--
-- Name: truck_trips truck_trips_truck_id_trucks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.truck_trips
    ADD CONSTRAINT truck_trips_truck_id_trucks_id_fk FOREIGN KEY (truck_id) REFERENCES public.trucks(id);


--
-- Name: worker_transactions worker_transactions_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_transactions
    ADD CONSTRAINT worker_transactions_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: worker_warnings worker_warnings_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_warnings
    ADD CONSTRAINT worker_warnings_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: workers workers_shift_id_work_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_shift_id_work_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.work_shifts(id);


--
-- Name: workers workers_worker_company_id_worker_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_worker_company_id_worker_companies_id_fk FOREIGN KEY (worker_company_id) REFERENCES public.worker_companies(id);


--
-- Name: workers workers_workshop_id_workshops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_workshop_id_workshops_id_fk FOREIGN KEY (workshop_id) REFERENCES public.workshops(id);


--
-- Name: workshop_expenses workshop_expenses_workshop_id_workshops_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_expenses
    ADD CONSTRAINT workshop_expenses_workshop_id_workshops_id_fk FOREIGN KEY (workshop_id) REFERENCES public.workshops(id);


--
-- PostgreSQL database dump complete
--

\unrestrict qnsJ3ADD6LAPlnQEvdg7WCPeVJYBIobJFGNj2ZIxYb9AbeQeIg8hiygzmH2iMt2

