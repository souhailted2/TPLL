--
-- PostgreSQL database dump
--

\restrict BI3Hfg7DZeI2GyTksMTU7E6at3fVt5bfugrchYY279ib6aARpqEQ1RY1qOSwENI

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

ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.push_tokens DROP CONSTRAINT IF EXISTS push_tokens_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_status_changed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_sales_point_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_products_id_fk;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_orders_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_order_id_orders_id_fk;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.push_tokens DROP CONSTRAINT IF EXISTS push_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_sku_unique;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS public.push_tokens ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_roles;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.push_tokens_id_seq;
DROP TABLE IF EXISTS public.push_tokens;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    order_id integer,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit text DEFAULT 'piece'::text NOT NULL,
    completed_quantity integer DEFAULT 0 NOT NULL,
    last_completed_update timestamp without time zone,
    item_status text DEFAULT 'pending'::text NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    sales_point_id character varying NOT NULL,
    status text DEFAULT 'submitted'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    status_changed_by character varying,
    status_changed_at timestamp without time zone,
    alert_dismissed boolean DEFAULT false NOT NULL,
    alert_dismissed_at timestamp without time zone,
    alert_notification_sent_at timestamp without time zone
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    description text,
    image_url text,
    finish text DEFAULT 'none'::text NOT NULL,
    size text
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: push_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_tokens (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: push_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.push_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: push_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.push_tokens_id_seq OWNED BY public.push_tokens.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id character varying NOT NULL,
    role text DEFAULT 'sales_point'::text NOT NULL,
    sales_point_name text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying NOT NULL,
    password text NOT NULL
);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: push_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_tokens ALTER COLUMN id SET DEFAULT nextval('public.push_tokens_id_seq'::regclass);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, order_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, unit, completed_quantity, last_completed_update, item_status) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, sales_point_id, status, created_at, status_changed_by, status_changed_at, alert_dismissed, alert_dismissed_at, alert_notification_sent_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, sku, description, image_url, finish, size) FROM stdin;
4210	Boulon Brut 6x12	BB612	\N	\N	none	6x12
4211	Boulon Zingué 6x12	BZ612	\N	\N	cold	6x12
4212	Boulon Zingué à chaud 6x12	BZC612	\N	\N	hot	6x12
4213	Boulon Acier 6x12	BA612	\N	\N	acier	6x12
4214	Boulon Brut 6x16	BB616	\N	\N	none	6x16
4215	Boulon Zingué 6x16	BZ616	\N	\N	cold	6x16
4216	Boulon Zingué à chaud 6x16	BZC616	\N	\N	hot	6x16
4217	Boulon Acier 6x16	BA616	\N	\N	acier	6x16
4218	Boulon Brut 6x20	BB620	\N	\N	none	6x20
4219	Boulon Zingué 6x20	BZ620	\N	\N	cold	6x20
4220	Boulon Zingué à chaud 6x20	BZC620	\N	\N	hot	6x20
4221	Boulon Acier 6x20	BA620	\N	\N	acier	6x20
4222	Boulon Brut 6x25	BB625	\N	\N	none	6x25
4223	Boulon Zingué 6x25	BZ625	\N	\N	cold	6x25
4224	Boulon Zingué à chaud 6x25	BZC625	\N	\N	hot	6x25
4225	Boulon Acier 6x25	BA625	\N	\N	acier	6x25
4226	Boulon Brut 6x30	BB630	\N	\N	none	6x30
4227	Boulon Zingué 6x30	BZ630	\N	\N	cold	6x30
4228	Boulon Zingué à chaud 6x30	BZC630	\N	\N	hot	6x30
4229	Boulon Acier 6x30	BA630	\N	\N	acier	6x30
4230	Boulon Brut 6x35	BB635	\N	\N	none	6x35
4231	Boulon Zingué 6x35	BZ635	\N	\N	cold	6x35
4232	Boulon Zingué à chaud 6x35	BZC635	\N	\N	hot	6x35
4233	Boulon Acier 6x35	BA635	\N	\N	acier	6x35
4234	Boulon Brut 6x40	BB640	\N	\N	none	6x40
4235	Boulon Zingué 6x40	BZ640	\N	\N	cold	6x40
4236	Boulon Zingué à chaud 6x40	BZC640	\N	\N	hot	6x40
4237	Boulon Acier 6x40	BA640	\N	\N	acier	6x40
4238	Boulon Brut 6x45	BB645	\N	\N	none	6x45
4239	Boulon Zingué 6x45	BZ645	\N	\N	cold	6x45
4240	Boulon Zingué à chaud 6x45	BZC645	\N	\N	hot	6x45
4241	Boulon Acier 6x45	BA645	\N	\N	acier	6x45
4242	Boulon Brut 6x50	BB650	\N	\N	none	6x50
4243	Boulon Zingué 6x50	BZ650	\N	\N	cold	6x50
4244	Boulon Zingué à chaud 6x50	BZC650	\N	\N	hot	6x50
4245	Boulon Acier 6x50	BA650	\N	\N	acier	6x50
4246	Boulon Brut 6x55	BB655	\N	\N	none	6x55
4247	Boulon Zingué 6x55	BZ655	\N	\N	cold	6x55
4248	Boulon Zingué à chaud 6x55	BZC655	\N	\N	hot	6x55
4249	Boulon Acier 6x55	BA655	\N	\N	acier	6x55
4250	Boulon Brut 6x60	BB660	\N	\N	none	6x60
4251	Boulon Zingué 6x60	BZ660	\N	\N	cold	6x60
4252	Boulon Zingué à chaud 6x60	BZC660	\N	\N	hot	6x60
4253	Boulon Acier 6x60	BA660	\N	\N	acier	6x60
4254	Boulon Brut 6x65	BB665	\N	\N	none	6x65
4255	Boulon Zingué 6x65	BZ665	\N	\N	cold	6x65
4256	Boulon Zingué à chaud 6x65	BZC665	\N	\N	hot	6x65
4257	Boulon Acier 6x65	BA665	\N	\N	acier	6x65
4258	Boulon Brut 6x70	BB670	\N	\N	none	6x70
4259	Boulon Zingué 6x70	BZ670	\N	\N	cold	6x70
4260	Boulon Zingué à chaud 6x70	BZC670	\N	\N	hot	6x70
4261	Boulon Acier 6x70	BA670	\N	\N	acier	6x70
4262	Boulon Brut 6x75	BB675	\N	\N	none	6x75
4263	Boulon Zingué 6x75	BZ675	\N	\N	cold	6x75
4264	Boulon Zingué à chaud 6x75	BZC675	\N	\N	hot	6x75
4265	Boulon Acier 6x75	BA675	\N	\N	acier	6x75
4266	Boulon Brut 6x80	BB680	\N	\N	none	6x80
4267	Boulon Zingué 6x80	BZ680	\N	\N	cold	6x80
4268	Boulon Zingué à chaud 6x80	BZC680	\N	\N	hot	6x80
4269	Boulon Acier 6x80	BA680	\N	\N	acier	6x80
4270	Boulon Brut 6x85	BB685	\N	\N	none	6x85
4271	Boulon Zingué 6x85	BZ685	\N	\N	cold	6x85
4272	Boulon Zingué à chaud 6x85	BZC685	\N	\N	hot	6x85
4273	Boulon Acier 6x85	BA685	\N	\N	acier	6x85
4274	Boulon Brut 6x90	BB690	\N	\N	none	6x90
4275	Boulon Zingué 6x90	BZ690	\N	\N	cold	6x90
4276	Boulon Zingué à chaud 6x90	BZC690	\N	\N	hot	6x90
4277	Boulon Acier 6x90	BA690	\N	\N	acier	6x90
4278	Boulon Brut 6x100	BB6100	\N	\N	none	6x100
4279	Boulon Zingué 6x100	BZ6100	\N	\N	cold	6x100
4280	Boulon Zingué à chaud 6x100	BZC6100	\N	\N	hot	6x100
4281	Boulon Acier 6x100	BA6100	\N	\N	acier	6x100
4282	Boulon Brut 6x110	BB6110	\N	\N	none	6x110
4283	Boulon Zingué 6x110	BZ6110	\N	\N	cold	6x110
4284	Boulon Zingué à chaud 6x110	BZC6110	\N	\N	hot	6x110
4285	Boulon Acier 6x110	BA6110	\N	\N	acier	6x110
4286	Boulon Brut 6x120	BB6120	\N	\N	none	6x120
4287	Boulon Zingué 6x120	BZ6120	\N	\N	cold	6x120
4288	Boulon Zingué à chaud 6x120	BZC6120	\N	\N	hot	6x120
4289	Boulon Acier 6x120	BA6120	\N	\N	acier	6x120
4290	Boulon Brut 6x130	BB6130	\N	\N	none	6x130
4291	Boulon Zingué 6x130	BZ6130	\N	\N	cold	6x130
4292	Boulon Zingué à chaud 6x130	BZC6130	\N	\N	hot	6x130
4293	Boulon Acier 6x130	BA6130	\N	\N	acier	6x130
4294	Boulon Brut 6x140	BB6140	\N	\N	none	6x140
4295	Boulon Zingué 6x140	BZ6140	\N	\N	cold	6x140
4296	Boulon Zingué à chaud 6x140	BZC6140	\N	\N	hot	6x140
4297	Boulon Acier 6x140	BA6140	\N	\N	acier	6x140
4298	Boulon Brut 6x150	BB6150	\N	\N	none	6x150
4299	Boulon Zingué 6x150	BZ6150	\N	\N	cold	6x150
4300	Boulon Zingué à chaud 6x150	BZC6150	\N	\N	hot	6x150
4301	Boulon Acier 6x150	BA6150	\N	\N	acier	6x150
4302	Boulon Brut 6x160	BB6160	\N	\N	none	6x160
4303	Boulon Zingué 6x160	BZ6160	\N	\N	cold	6x160
4304	Boulon Zingué à chaud 6x160	BZC6160	\N	\N	hot	6x160
4305	Boulon Acier 6x160	BA6160	\N	\N	acier	6x160
4306	Boulon Brut 6x170	BB6170	\N	\N	none	6x170
4307	Boulon Zingué 6x170	BZ6170	\N	\N	cold	6x170
4308	Boulon Zingué à chaud 6x170	BZC6170	\N	\N	hot	6x170
4309	Boulon Acier 6x170	BA6170	\N	\N	acier	6x170
4310	Boulon Brut 6x180	BB6180	\N	\N	none	6x180
4311	Boulon Zingué 6x180	BZ6180	\N	\N	cold	6x180
4312	Boulon Zingué à chaud 6x180	BZC6180	\N	\N	hot	6x180
4313	Boulon Acier 6x180	BA6180	\N	\N	acier	6x180
4314	Boulon Brut 6x190	BB6190	\N	\N	none	6x190
4315	Boulon Zingué 6x190	BZ6190	\N	\N	cold	6x190
4316	Boulon Zingué à chaud 6x190	BZC6190	\N	\N	hot	6x190
4317	Boulon Acier 6x190	BA6190	\N	\N	acier	6x190
4318	Boulon Brut 6x200	BB6200	\N	\N	none	6x200
4319	Boulon Zingué 6x200	BZ6200	\N	\N	cold	6x200
4320	Boulon Zingué à chaud 6x200	BZC6200	\N	\N	hot	6x200
4321	Boulon Acier 6x200	BA6200	\N	\N	acier	6x200
4322	Boulon Brut 8x12	BB812	\N	\N	none	8x12
4323	Boulon Zingué 8x12	BZ812	\N	\N	cold	8x12
4324	Boulon Zingué à chaud 8x12	BZC812	\N	\N	hot	8x12
4325	Boulon Acier 8x12	BA812	\N	\N	acier	8x12
4326	Boulon Brut 8x16	BB816	\N	\N	none	8x16
4327	Boulon Zingué 8x16	BZ816	\N	\N	cold	8x16
4328	Boulon Zingué à chaud 8x16	BZC816	\N	\N	hot	8x16
4329	Boulon Acier 8x16	BA816	\N	\N	acier	8x16
4330	Boulon Brut 8x20	BB820	\N	\N	none	8x20
4331	Boulon Zingué 8x20	BZ820	\N	\N	cold	8x20
4332	Boulon Zingué à chaud 8x20	BZC820	\N	\N	hot	8x20
4333	Boulon Acier 8x20	BA820	\N	\N	acier	8x20
4334	Boulon Brut 8x25	BB825	\N	\N	none	8x25
4335	Boulon Zingué 8x25	BZ825	\N	\N	cold	8x25
4336	Boulon Zingué à chaud 8x25	BZC825	\N	\N	hot	8x25
4337	Boulon Acier 8x25	BA825	\N	\N	acier	8x25
4338	Boulon Brut 8x30	BB830	\N	\N	none	8x30
4339	Boulon Zingué 8x30	BZ830	\N	\N	cold	8x30
4340	Boulon Zingué à chaud 8x30	BZC830	\N	\N	hot	8x30
4341	Boulon Acier 8x30	BA830	\N	\N	acier	8x30
4342	Boulon Brut 8x35	BB835	\N	\N	none	8x35
4343	Boulon Zingué 8x35	BZ835	\N	\N	cold	8x35
4344	Boulon Zingué à chaud 8x35	BZC835	\N	\N	hot	8x35
4345	Boulon Acier 8x35	BA835	\N	\N	acier	8x35
4346	Boulon Brut 8x40	BB840	\N	\N	none	8x40
4347	Boulon Zingué 8x40	BZ840	\N	\N	cold	8x40
4348	Boulon Zingué à chaud 8x40	BZC840	\N	\N	hot	8x40
4349	Boulon Acier 8x40	BA840	\N	\N	acier	8x40
4350	Boulon Brut 8x45	BB845	\N	\N	none	8x45
4351	Boulon Zingué 8x45	BZ845	\N	\N	cold	8x45
4352	Boulon Zingué à chaud 8x45	BZC845	\N	\N	hot	8x45
4353	Boulon Acier 8x45	BA845	\N	\N	acier	8x45
4354	Boulon Brut 8x50	BB850	\N	\N	none	8x50
4355	Boulon Zingué 8x50	BZ850	\N	\N	cold	8x50
4356	Boulon Zingué à chaud 8x50	BZC850	\N	\N	hot	8x50
4357	Boulon Acier 8x50	BA850	\N	\N	acier	8x50
4358	Boulon Brut 8x55	BB855	\N	\N	none	8x55
4359	Boulon Zingué 8x55	BZ855	\N	\N	cold	8x55
4360	Boulon Zingué à chaud 8x55	BZC855	\N	\N	hot	8x55
4361	Boulon Acier 8x55	BA855	\N	\N	acier	8x55
4362	Boulon Brut 8x60	BB860	\N	\N	none	8x60
4363	Boulon Zingué 8x60	BZ860	\N	\N	cold	8x60
4364	Boulon Zingué à chaud 8x60	BZC860	\N	\N	hot	8x60
4365	Boulon Acier 8x60	BA860	\N	\N	acier	8x60
4366	Boulon Brut 8x65	BB865	\N	\N	none	8x65
4367	Boulon Zingué 8x65	BZ865	\N	\N	cold	8x65
4368	Boulon Zingué à chaud 8x65	BZC865	\N	\N	hot	8x65
4369	Boulon Acier 8x65	BA865	\N	\N	acier	8x65
4370	Boulon Brut 8x70	BB870	\N	\N	none	8x70
4371	Boulon Zingué 8x70	BZ870	\N	\N	cold	8x70
4372	Boulon Zingué à chaud 8x70	BZC870	\N	\N	hot	8x70
4373	Boulon Acier 8x70	BA870	\N	\N	acier	8x70
4374	Boulon Brut 8x75	BB875	\N	\N	none	8x75
4375	Boulon Zingué 8x75	BZ875	\N	\N	cold	8x75
4376	Boulon Zingué à chaud 8x75	BZC875	\N	\N	hot	8x75
4377	Boulon Acier 8x75	BA875	\N	\N	acier	8x75
4378	Boulon Brut 8x80	BB880	\N	\N	none	8x80
4379	Boulon Zingué 8x80	BZ880	\N	\N	cold	8x80
4380	Boulon Zingué à chaud 8x80	BZC880	\N	\N	hot	8x80
4381	Boulon Acier 8x80	BA880	\N	\N	acier	8x80
4382	Boulon Brut 8x85	BB885	\N	\N	none	8x85
4383	Boulon Zingué 8x85	BZ885	\N	\N	cold	8x85
4384	Boulon Zingué à chaud 8x85	BZC885	\N	\N	hot	8x85
4385	Boulon Acier 8x85	BA885	\N	\N	acier	8x85
4386	Boulon Brut 8x90	BB890	\N	\N	none	8x90
4387	Boulon Zingué 8x90	BZ890	\N	\N	cold	8x90
4388	Boulon Zingué à chaud 8x90	BZC890	\N	\N	hot	8x90
4389	Boulon Acier 8x90	BA890	\N	\N	acier	8x90
4390	Boulon Brut 8x100	BB8100	\N	\N	none	8x100
4391	Boulon Zingué 8x100	BZ8100	\N	\N	cold	8x100
4392	Boulon Zingué à chaud 8x100	BZC8100	\N	\N	hot	8x100
4393	Boulon Acier 8x100	BA8100	\N	\N	acier	8x100
4394	Boulon Brut 8x110	BB8110	\N	\N	none	8x110
4395	Boulon Zingué 8x110	BZ8110	\N	\N	cold	8x110
4396	Boulon Zingué à chaud 8x110	BZC8110	\N	\N	hot	8x110
4397	Boulon Acier 8x110	BA8110	\N	\N	acier	8x110
4398	Boulon Brut 8x120	BB8120	\N	\N	none	8x120
4399	Boulon Zingué 8x120	BZ8120	\N	\N	cold	8x120
4400	Boulon Zingué à chaud 8x120	BZC8120	\N	\N	hot	8x120
4401	Boulon Acier 8x120	BA8120	\N	\N	acier	8x120
4402	Boulon Brut 8x130	BB8130	\N	\N	none	8x130
4403	Boulon Zingué 8x130	BZ8130	\N	\N	cold	8x130
4404	Boulon Zingué à chaud 8x130	BZC8130	\N	\N	hot	8x130
4405	Boulon Acier 8x130	BA8130	\N	\N	acier	8x130
4406	Boulon Brut 8x140	BB8140	\N	\N	none	8x140
4407	Boulon Zingué 8x140	BZ8140	\N	\N	cold	8x140
4408	Boulon Zingué à chaud 8x140	BZC8140	\N	\N	hot	8x140
4409	Boulon Acier 8x140	BA8140	\N	\N	acier	8x140
4410	Boulon Brut 8x150	BB8150	\N	\N	none	8x150
4411	Boulon Zingué 8x150	BZ8150	\N	\N	cold	8x150
4412	Boulon Zingué à chaud 8x150	BZC8150	\N	\N	hot	8x150
4413	Boulon Acier 8x150	BA8150	\N	\N	acier	8x150
4414	Boulon Brut 8x160	BB8160	\N	\N	none	8x160
4415	Boulon Zingué 8x160	BZ8160	\N	\N	cold	8x160
4416	Boulon Zingué à chaud 8x160	BZC8160	\N	\N	hot	8x160
4417	Boulon Acier 8x160	BA8160	\N	\N	acier	8x160
4418	Boulon Brut 8x170	BB8170	\N	\N	none	8x170
4419	Boulon Zingué 8x170	BZ8170	\N	\N	cold	8x170
4420	Boulon Zingué à chaud 8x170	BZC8170	\N	\N	hot	8x170
4421	Boulon Acier 8x170	BA8170	\N	\N	acier	8x170
4422	Boulon Brut 8x180	BB8180	\N	\N	none	8x180
4423	Boulon Zingué 8x180	BZ8180	\N	\N	cold	8x180
4424	Boulon Zingué à chaud 8x180	BZC8180	\N	\N	hot	8x180
4425	Boulon Acier 8x180	BA8180	\N	\N	acier	8x180
4426	Boulon Brut 8x190	BB8190	\N	\N	none	8x190
4427	Boulon Zingué 8x190	BZ8190	\N	\N	cold	8x190
4428	Boulon Zingué à chaud 8x190	BZC8190	\N	\N	hot	8x190
4429	Boulon Acier 8x190	BA8190	\N	\N	acier	8x190
4430	Boulon Brut 8x200	BB8200	\N	\N	none	8x200
4431	Boulon Zingué 8x200	BZ8200	\N	\N	cold	8x200
4432	Boulon Zingué à chaud 8x200	BZC8200	\N	\N	hot	8x200
4433	Boulon Acier 8x200	BA8200	\N	\N	acier	8x200
4434	Boulon Brut 10x12	BB1012	\N	\N	none	10x12
4435	Boulon Zingué 10x12	BZ1012	\N	\N	cold	10x12
4436	Boulon Zingué à chaud 10x12	BZC1012	\N	\N	hot	10x12
4437	Boulon Acier 10x12	BA1012	\N	\N	acier	10x12
4438	Boulon Brut 10x16	BB1016	\N	\N	none	10x16
4439	Boulon Zingué 10x16	BZ1016	\N	\N	cold	10x16
4440	Boulon Zingué à chaud 10x16	BZC1016	\N	\N	hot	10x16
4441	Boulon Acier 10x16	BA1016	\N	\N	acier	10x16
4442	Boulon Brut 10x20	BB1020	\N	\N	none	10x20
4443	Boulon Zingué 10x20	BZ1020	\N	\N	cold	10x20
4444	Boulon Zingué à chaud 10x20	BZC1020	\N	\N	hot	10x20
4445	Boulon Acier 10x20	BA1020	\N	\N	acier	10x20
4446	Boulon Brut 10x25	BB1025	\N	\N	none	10x25
4447	Boulon Zingué 10x25	BZ1025	\N	\N	cold	10x25
4448	Boulon Zingué à chaud 10x25	BZC1025	\N	\N	hot	10x25
4449	Boulon Acier 10x25	BA1025	\N	\N	acier	10x25
4450	Boulon Brut 10x30	BB1030	\N	\N	none	10x30
4451	Boulon Zingué 10x30	BZ1030	\N	\N	cold	10x30
4452	Boulon Zingué à chaud 10x30	BZC1030	\N	\N	hot	10x30
4453	Boulon Acier 10x30	BA1030	\N	\N	acier	10x30
4454	Boulon Brut 10x35	BB1035	\N	\N	none	10x35
4455	Boulon Zingué 10x35	BZ1035	\N	\N	cold	10x35
4456	Boulon Zingué à chaud 10x35	BZC1035	\N	\N	hot	10x35
4457	Boulon Acier 10x35	BA1035	\N	\N	acier	10x35
4458	Boulon Brut 10x40	BB1040	\N	\N	none	10x40
4459	Boulon Zingué 10x40	BZ1040	\N	\N	cold	10x40
4460	Boulon Zingué à chaud 10x40	BZC1040	\N	\N	hot	10x40
4461	Boulon Acier 10x40	BA1040	\N	\N	acier	10x40
4462	Boulon Brut 10x45	BB1045	\N	\N	none	10x45
4463	Boulon Zingué 10x45	BZ1045	\N	\N	cold	10x45
4464	Boulon Zingué à chaud 10x45	BZC1045	\N	\N	hot	10x45
4465	Boulon Acier 10x45	BA1045	\N	\N	acier	10x45
4466	Boulon Brut 10x50	BB1050	\N	\N	none	10x50
4467	Boulon Zingué 10x50	BZ1050	\N	\N	cold	10x50
4468	Boulon Zingué à chaud 10x50	BZC1050	\N	\N	hot	10x50
4469	Boulon Acier 10x50	BA1050	\N	\N	acier	10x50
4470	Boulon Brut 10x55	BB1055	\N	\N	none	10x55
4471	Boulon Zingué 10x55	BZ1055	\N	\N	cold	10x55
4472	Boulon Zingué à chaud 10x55	BZC1055	\N	\N	hot	10x55
4473	Boulon Acier 10x55	BA1055	\N	\N	acier	10x55
4474	Boulon Brut 10x60	BB1060	\N	\N	none	10x60
4475	Boulon Zingué 10x60	BZ1060	\N	\N	cold	10x60
4476	Boulon Zingué à chaud 10x60	BZC1060	\N	\N	hot	10x60
4477	Boulon Acier 10x60	BA1060	\N	\N	acier	10x60
4478	Boulon Brut 10x65	BB1065	\N	\N	none	10x65
4479	Boulon Zingué 10x65	BZ1065	\N	\N	cold	10x65
4480	Boulon Zingué à chaud 10x65	BZC1065	\N	\N	hot	10x65
4481	Boulon Acier 10x65	BA1065	\N	\N	acier	10x65
4482	Boulon Brut 10x70	BB1070	\N	\N	none	10x70
4483	Boulon Zingué 10x70	BZ1070	\N	\N	cold	10x70
4484	Boulon Zingué à chaud 10x70	BZC1070	\N	\N	hot	10x70
4485	Boulon Acier 10x70	BA1070	\N	\N	acier	10x70
4486	Boulon Brut 10x75	BB1075	\N	\N	none	10x75
4487	Boulon Zingué 10x75	BZ1075	\N	\N	cold	10x75
4488	Boulon Zingué à chaud 10x75	BZC1075	\N	\N	hot	10x75
4489	Boulon Acier 10x75	BA1075	\N	\N	acier	10x75
4490	Boulon Brut 10x80	BB1080	\N	\N	none	10x80
4491	Boulon Zingué 10x80	BZ1080	\N	\N	cold	10x80
4492	Boulon Zingué à chaud 10x80	BZC1080	\N	\N	hot	10x80
4493	Boulon Acier 10x80	BA1080	\N	\N	acier	10x80
4494	Boulon Brut 10x85	BB1085	\N	\N	none	10x85
4495	Boulon Zingué 10x85	BZ1085	\N	\N	cold	10x85
4496	Boulon Zingué à chaud 10x85	BZC1085	\N	\N	hot	10x85
4497	Boulon Acier 10x85	BA1085	\N	\N	acier	10x85
4498	Boulon Brut 10x90	BB1090	\N	\N	none	10x90
4499	Boulon Zingué 10x90	BZ1090	\N	\N	cold	10x90
4500	Boulon Zingué à chaud 10x90	BZC1090	\N	\N	hot	10x90
4501	Boulon Acier 10x90	BA1090	\N	\N	acier	10x90
4502	Boulon Brut 10x100	BB10100	\N	\N	none	10x100
4503	Boulon Zingué 10x100	BZ10100	\N	\N	cold	10x100
4504	Boulon Zingué à chaud 10x100	BZC10100	\N	\N	hot	10x100
4505	Boulon Acier 10x100	BA10100	\N	\N	acier	10x100
4506	Boulon Brut 10x110	BB10110	\N	\N	none	10x110
4507	Boulon Zingué 10x110	BZ10110	\N	\N	cold	10x110
4508	Boulon Zingué à chaud 10x110	BZC10110	\N	\N	hot	10x110
4509	Boulon Acier 10x110	BA10110	\N	\N	acier	10x110
4510	Boulon Brut 10x120	BB10120	\N	\N	none	10x120
4511	Boulon Zingué 10x120	BZ10120	\N	\N	cold	10x120
4512	Boulon Zingué à chaud 10x120	BZC10120	\N	\N	hot	10x120
4513	Boulon Acier 10x120	BA10120	\N	\N	acier	10x120
4514	Boulon Brut 10x130	BB10130	\N	\N	none	10x130
4515	Boulon Zingué 10x130	BZ10130	\N	\N	cold	10x130
4516	Boulon Zingué à chaud 10x130	BZC10130	\N	\N	hot	10x130
4517	Boulon Acier 10x130	BA10130	\N	\N	acier	10x130
4518	Boulon Brut 10x140	BB10140	\N	\N	none	10x140
4519	Boulon Zingué 10x140	BZ10140	\N	\N	cold	10x140
4520	Boulon Zingué à chaud 10x140	BZC10140	\N	\N	hot	10x140
4521	Boulon Acier 10x140	BA10140	\N	\N	acier	10x140
4522	Boulon Brut 10x150	BB10150	\N	\N	none	10x150
4523	Boulon Zingué 10x150	BZ10150	\N	\N	cold	10x150
4524	Boulon Zingué à chaud 10x150	BZC10150	\N	\N	hot	10x150
4525	Boulon Acier 10x150	BA10150	\N	\N	acier	10x150
4526	Boulon Brut 10x160	BB10160	\N	\N	none	10x160
4527	Boulon Zingué 10x160	BZ10160	\N	\N	cold	10x160
4528	Boulon Zingué à chaud 10x160	BZC10160	\N	\N	hot	10x160
4529	Boulon Acier 10x160	BA10160	\N	\N	acier	10x160
4530	Boulon Brut 10x170	BB10170	\N	\N	none	10x170
4531	Boulon Zingué 10x170	BZ10170	\N	\N	cold	10x170
4532	Boulon Zingué à chaud 10x170	BZC10170	\N	\N	hot	10x170
4533	Boulon Acier 10x170	BA10170	\N	\N	acier	10x170
4534	Boulon Brut 10x180	BB10180	\N	\N	none	10x180
4535	Boulon Zingué 10x180	BZ10180	\N	\N	cold	10x180
4536	Boulon Zingué à chaud 10x180	BZC10180	\N	\N	hot	10x180
4537	Boulon Acier 10x180	BA10180	\N	\N	acier	10x180
4538	Boulon Brut 10x190	BB10190	\N	\N	none	10x190
4539	Boulon Zingué 10x190	BZ10190	\N	\N	cold	10x190
4540	Boulon Zingué à chaud 10x190	BZC10190	\N	\N	hot	10x190
4541	Boulon Acier 10x190	BA10190	\N	\N	acier	10x190
4542	Boulon Brut 10x200	BB10200	\N	\N	none	10x200
4543	Boulon Zingué 10x200	BZ10200	\N	\N	cold	10x200
4544	Boulon Zingué à chaud 10x200	BZC10200	\N	\N	hot	10x200
4545	Boulon Acier 10x200	BA10200	\N	\N	acier	10x200
4546	Boulon Brut 12x12	BB1212	\N	\N	none	12x12
4547	Boulon Zingué 12x12	BZ1212	\N	\N	cold	12x12
4548	Boulon Zingué à chaud 12x12	BZC1212	\N	\N	hot	12x12
4549	Boulon Acier 12x12	BA1212	\N	\N	acier	12x12
4550	Boulon Brut 12x16	BB1216	\N	\N	none	12x16
4551	Boulon Zingué 12x16	BZ1216	\N	\N	cold	12x16
4552	Boulon Zingué à chaud 12x16	BZC1216	\N	\N	hot	12x16
4553	Boulon Acier 12x16	BA1216	\N	\N	acier	12x16
4554	Boulon Brut 12x20	BB1220	\N	\N	none	12x20
4555	Boulon Zingué 12x20	BZ1220	\N	\N	cold	12x20
4556	Boulon Zingué à chaud 12x20	BZC1220	\N	\N	hot	12x20
4557	Boulon Acier 12x20	BA1220	\N	\N	acier	12x20
4558	Boulon Brut 12x25	BB1225	\N	\N	none	12x25
4559	Boulon Zingué 12x25	BZ1225	\N	\N	cold	12x25
4560	Boulon Zingué à chaud 12x25	BZC1225	\N	\N	hot	12x25
4561	Boulon Acier 12x25	BA1225	\N	\N	acier	12x25
4562	Boulon Brut 12x30	BB1230	\N	\N	none	12x30
4563	Boulon Zingué 12x30	BZ1230	\N	\N	cold	12x30
4564	Boulon Zingué à chaud 12x30	BZC1230	\N	\N	hot	12x30
4565	Boulon Acier 12x30	BA1230	\N	\N	acier	12x30
4566	Boulon Brut 12x35	BB1235	\N	\N	none	12x35
4567	Boulon Zingué 12x35	BZ1235	\N	\N	cold	12x35
4568	Boulon Zingué à chaud 12x35	BZC1235	\N	\N	hot	12x35
4569	Boulon Acier 12x35	BA1235	\N	\N	acier	12x35
4570	Boulon Brut 12x40	BB1240	\N	\N	none	12x40
4571	Boulon Zingué 12x40	BZ1240	\N	\N	cold	12x40
4572	Boulon Zingué à chaud 12x40	BZC1240	\N	\N	hot	12x40
4573	Boulon Acier 12x40	BA1240	\N	\N	acier	12x40
4574	Boulon Brut 12x45	BB1245	\N	\N	none	12x45
4575	Boulon Zingué 12x45	BZ1245	\N	\N	cold	12x45
4576	Boulon Zingué à chaud 12x45	BZC1245	\N	\N	hot	12x45
4577	Boulon Acier 12x45	BA1245	\N	\N	acier	12x45
4578	Boulon Brut 12x50	BB1250	\N	\N	none	12x50
4579	Boulon Zingué 12x50	BZ1250	\N	\N	cold	12x50
4580	Boulon Zingué à chaud 12x50	BZC1250	\N	\N	hot	12x50
4581	Boulon Acier 12x50	BA1250	\N	\N	acier	12x50
4582	Boulon Brut 12x55	BB1255	\N	\N	none	12x55
4583	Boulon Zingué 12x55	BZ1255	\N	\N	cold	12x55
4584	Boulon Zingué à chaud 12x55	BZC1255	\N	\N	hot	12x55
4585	Boulon Acier 12x55	BA1255	\N	\N	acier	12x55
4586	Boulon Brut 12x60	BB1260	\N	\N	none	12x60
4587	Boulon Zingué 12x60	BZ1260	\N	\N	cold	12x60
4588	Boulon Zingué à chaud 12x60	BZC1260	\N	\N	hot	12x60
4589	Boulon Acier 12x60	BA1260	\N	\N	acier	12x60
4590	Boulon Brut 12x65	BB1265	\N	\N	none	12x65
4591	Boulon Zingué 12x65	BZ1265	\N	\N	cold	12x65
4592	Boulon Zingué à chaud 12x65	BZC1265	\N	\N	hot	12x65
4593	Boulon Acier 12x65	BA1265	\N	\N	acier	12x65
4594	Boulon Brut 12x70	BB1270	\N	\N	none	12x70
4595	Boulon Zingué 12x70	BZ1270	\N	\N	cold	12x70
4596	Boulon Zingué à chaud 12x70	BZC1270	\N	\N	hot	12x70
4597	Boulon Acier 12x70	BA1270	\N	\N	acier	12x70
4598	Boulon Brut 12x75	BB1275	\N	\N	none	12x75
4599	Boulon Zingué 12x75	BZ1275	\N	\N	cold	12x75
4600	Boulon Zingué à chaud 12x75	BZC1275	\N	\N	hot	12x75
4601	Boulon Acier 12x75	BA1275	\N	\N	acier	12x75
4602	Boulon Brut 12x80	BB1280	\N	\N	none	12x80
4603	Boulon Zingué 12x80	BZ1280	\N	\N	cold	12x80
4604	Boulon Zingué à chaud 12x80	BZC1280	\N	\N	hot	12x80
4605	Boulon Acier 12x80	BA1280	\N	\N	acier	12x80
4606	Boulon Brut 12x85	BB1285	\N	\N	none	12x85
4607	Boulon Zingué 12x85	BZ1285	\N	\N	cold	12x85
4608	Boulon Zingué à chaud 12x85	BZC1285	\N	\N	hot	12x85
4609	Boulon Acier 12x85	BA1285	\N	\N	acier	12x85
4610	Boulon Brut 12x90	BB1290	\N	\N	none	12x90
4611	Boulon Zingué 12x90	BZ1290	\N	\N	cold	12x90
4612	Boulon Zingué à chaud 12x90	BZC1290	\N	\N	hot	12x90
4613	Boulon Acier 12x90	BA1290	\N	\N	acier	12x90
4614	Boulon Brut 12x100	BB12100	\N	\N	none	12x100
4615	Boulon Zingué 12x100	BZ12100	\N	\N	cold	12x100
4616	Boulon Zingué à chaud 12x100	BZC12100	\N	\N	hot	12x100
4617	Boulon Acier 12x100	BA12100	\N	\N	acier	12x100
4618	Boulon Brut 12x110	BB12110	\N	\N	none	12x110
4619	Boulon Zingué 12x110	BZ12110	\N	\N	cold	12x110
4620	Boulon Zingué à chaud 12x110	BZC12110	\N	\N	hot	12x110
4621	Boulon Acier 12x110	BA12110	\N	\N	acier	12x110
4622	Boulon Brut 12x120	BB12120	\N	\N	none	12x120
4623	Boulon Zingué 12x120	BZ12120	\N	\N	cold	12x120
4624	Boulon Zingué à chaud 12x120	BZC12120	\N	\N	hot	12x120
4625	Boulon Acier 12x120	BA12120	\N	\N	acier	12x120
4626	Boulon Brut 12x130	BB12130	\N	\N	none	12x130
4627	Boulon Zingué 12x130	BZ12130	\N	\N	cold	12x130
4628	Boulon Zingué à chaud 12x130	BZC12130	\N	\N	hot	12x130
4629	Boulon Acier 12x130	BA12130	\N	\N	acier	12x130
4630	Boulon Brut 12x140	BB12140	\N	\N	none	12x140
4631	Boulon Zingué 12x140	BZ12140	\N	\N	cold	12x140
4632	Boulon Zingué à chaud 12x140	BZC12140	\N	\N	hot	12x140
4633	Boulon Acier 12x140	BA12140	\N	\N	acier	12x140
4634	Boulon Brut 12x150	BB12150	\N	\N	none	12x150
4635	Boulon Zingué 12x150	BZ12150	\N	\N	cold	12x150
4636	Boulon Zingué à chaud 12x150	BZC12150	\N	\N	hot	12x150
4637	Boulon Acier 12x150	BA12150	\N	\N	acier	12x150
4638	Boulon Brut 12x160	BB12160	\N	\N	none	12x160
4639	Boulon Zingué 12x160	BZ12160	\N	\N	cold	12x160
4640	Boulon Zingué à chaud 12x160	BZC12160	\N	\N	hot	12x160
4641	Boulon Acier 12x160	BA12160	\N	\N	acier	12x160
4642	Boulon Brut 12x170	BB12170	\N	\N	none	12x170
4643	Boulon Zingué 12x170	BZ12170	\N	\N	cold	12x170
4644	Boulon Zingué à chaud 12x170	BZC12170	\N	\N	hot	12x170
4645	Boulon Acier 12x170	BA12170	\N	\N	acier	12x170
4646	Boulon Brut 12x180	BB12180	\N	\N	none	12x180
4647	Boulon Zingué 12x180	BZ12180	\N	\N	cold	12x180
4648	Boulon Zingué à chaud 12x180	BZC12180	\N	\N	hot	12x180
4649	Boulon Acier 12x180	BA12180	\N	\N	acier	12x180
4650	Boulon Brut 12x190	BB12190	\N	\N	none	12x190
4651	Boulon Zingué 12x190	BZ12190	\N	\N	cold	12x190
4652	Boulon Zingué à chaud 12x190	BZC12190	\N	\N	hot	12x190
4653	Boulon Acier 12x190	BA12190	\N	\N	acier	12x190
4654	Boulon Brut 12x200	BB12200	\N	\N	none	12x200
4655	Boulon Zingué 12x200	BZ12200	\N	\N	cold	12x200
4656	Boulon Zingué à chaud 12x200	BZC12200	\N	\N	hot	12x200
4657	Boulon Acier 12x200	BA12200	\N	\N	acier	12x200
4658	Boulon Brut 14x12	BB1412	\N	\N	none	14x12
4659	Boulon Zingué 14x12	BZ1412	\N	\N	cold	14x12
4660	Boulon Zingué à chaud 14x12	BZC1412	\N	\N	hot	14x12
4661	Boulon Acier 14x12	BA1412	\N	\N	acier	14x12
4662	Boulon Brut 14x16	BB1416	\N	\N	none	14x16
4663	Boulon Zingué 14x16	BZ1416	\N	\N	cold	14x16
4664	Boulon Zingué à chaud 14x16	BZC1416	\N	\N	hot	14x16
4665	Boulon Acier 14x16	BA1416	\N	\N	acier	14x16
4666	Boulon Brut 14x20	BB1420	\N	\N	none	14x20
4667	Boulon Zingué 14x20	BZ1420	\N	\N	cold	14x20
4668	Boulon Zingué à chaud 14x20	BZC1420	\N	\N	hot	14x20
4669	Boulon Acier 14x20	BA1420	\N	\N	acier	14x20
4670	Boulon Brut 14x25	BB1425	\N	\N	none	14x25
4671	Boulon Zingué 14x25	BZ1425	\N	\N	cold	14x25
4672	Boulon Zingué à chaud 14x25	BZC1425	\N	\N	hot	14x25
4673	Boulon Acier 14x25	BA1425	\N	\N	acier	14x25
4674	Boulon Brut 14x30	BB1430	\N	\N	none	14x30
4675	Boulon Zingué 14x30	BZ1430	\N	\N	cold	14x30
4676	Boulon Zingué à chaud 14x30	BZC1430	\N	\N	hot	14x30
4677	Boulon Acier 14x30	BA1430	\N	\N	acier	14x30
4678	Boulon Brut 14x35	BB1435	\N	\N	none	14x35
4679	Boulon Zingué 14x35	BZ1435	\N	\N	cold	14x35
4680	Boulon Zingué à chaud 14x35	BZC1435	\N	\N	hot	14x35
4681	Boulon Acier 14x35	BA1435	\N	\N	acier	14x35
4682	Boulon Brut 14x40	BB1440	\N	\N	none	14x40
4683	Boulon Zingué 14x40	BZ1440	\N	\N	cold	14x40
4684	Boulon Zingué à chaud 14x40	BZC1440	\N	\N	hot	14x40
4685	Boulon Acier 14x40	BA1440	\N	\N	acier	14x40
4686	Boulon Brut 14x45	BB1445	\N	\N	none	14x45
4687	Boulon Zingué 14x45	BZ1445	\N	\N	cold	14x45
4688	Boulon Zingué à chaud 14x45	BZC1445	\N	\N	hot	14x45
4689	Boulon Acier 14x45	BA1445	\N	\N	acier	14x45
4690	Boulon Brut 14x50	BB1450	\N	\N	none	14x50
4691	Boulon Zingué 14x50	BZ1450	\N	\N	cold	14x50
4692	Boulon Zingué à chaud 14x50	BZC1450	\N	\N	hot	14x50
4693	Boulon Acier 14x50	BA1450	\N	\N	acier	14x50
4694	Boulon Brut 14x55	BB1455	\N	\N	none	14x55
4695	Boulon Zingué 14x55	BZ1455	\N	\N	cold	14x55
4696	Boulon Zingué à chaud 14x55	BZC1455	\N	\N	hot	14x55
4697	Boulon Acier 14x55	BA1455	\N	\N	acier	14x55
4698	Boulon Brut 14x60	BB1460	\N	\N	none	14x60
4699	Boulon Zingué 14x60	BZ1460	\N	\N	cold	14x60
4700	Boulon Zingué à chaud 14x60	BZC1460	\N	\N	hot	14x60
4701	Boulon Acier 14x60	BA1460	\N	\N	acier	14x60
4702	Boulon Brut 14x65	BB1465	\N	\N	none	14x65
4703	Boulon Zingué 14x65	BZ1465	\N	\N	cold	14x65
4704	Boulon Zingué à chaud 14x65	BZC1465	\N	\N	hot	14x65
4705	Boulon Acier 14x65	BA1465	\N	\N	acier	14x65
4706	Boulon Brut 14x70	BB1470	\N	\N	none	14x70
4707	Boulon Zingué 14x70	BZ1470	\N	\N	cold	14x70
4708	Boulon Zingué à chaud 14x70	BZC1470	\N	\N	hot	14x70
4709	Boulon Acier 14x70	BA1470	\N	\N	acier	14x70
4710	Boulon Brut 14x75	BB1475	\N	\N	none	14x75
4711	Boulon Zingué 14x75	BZ1475	\N	\N	cold	14x75
4712	Boulon Zingué à chaud 14x75	BZC1475	\N	\N	hot	14x75
4713	Boulon Acier 14x75	BA1475	\N	\N	acier	14x75
4714	Boulon Brut 14x80	BB1480	\N	\N	none	14x80
4715	Boulon Zingué 14x80	BZ1480	\N	\N	cold	14x80
4716	Boulon Zingué à chaud 14x80	BZC1480	\N	\N	hot	14x80
4717	Boulon Acier 14x80	BA1480	\N	\N	acier	14x80
4718	Boulon Brut 14x85	BB1485	\N	\N	none	14x85
4719	Boulon Zingué 14x85	BZ1485	\N	\N	cold	14x85
4720	Boulon Zingué à chaud 14x85	BZC1485	\N	\N	hot	14x85
4721	Boulon Acier 14x85	BA1485	\N	\N	acier	14x85
4722	Boulon Brut 14x90	BB1490	\N	\N	none	14x90
4723	Boulon Zingué 14x90	BZ1490	\N	\N	cold	14x90
4724	Boulon Zingué à chaud 14x90	BZC1490	\N	\N	hot	14x90
4725	Boulon Acier 14x90	BA1490	\N	\N	acier	14x90
4726	Boulon Brut 14x100	BB14100	\N	\N	none	14x100
4727	Boulon Zingué 14x100	BZ14100	\N	\N	cold	14x100
4728	Boulon Zingué à chaud 14x100	BZC14100	\N	\N	hot	14x100
4729	Boulon Acier 14x100	BA14100	\N	\N	acier	14x100
4730	Boulon Brut 14x110	BB14110	\N	\N	none	14x110
4731	Boulon Zingué 14x110	BZ14110	\N	\N	cold	14x110
4732	Boulon Zingué à chaud 14x110	BZC14110	\N	\N	hot	14x110
4733	Boulon Acier 14x110	BA14110	\N	\N	acier	14x110
4734	Boulon Brut 14x120	BB14120	\N	\N	none	14x120
4735	Boulon Zingué 14x120	BZ14120	\N	\N	cold	14x120
4736	Boulon Zingué à chaud 14x120	BZC14120	\N	\N	hot	14x120
4737	Boulon Acier 14x120	BA14120	\N	\N	acier	14x120
4738	Boulon Brut 14x130	BB14130	\N	\N	none	14x130
4739	Boulon Zingué 14x130	BZ14130	\N	\N	cold	14x130
4740	Boulon Zingué à chaud 14x130	BZC14130	\N	\N	hot	14x130
4741	Boulon Acier 14x130	BA14130	\N	\N	acier	14x130
4742	Boulon Brut 14x140	BB14140	\N	\N	none	14x140
4743	Boulon Zingué 14x140	BZ14140	\N	\N	cold	14x140
4744	Boulon Zingué à chaud 14x140	BZC14140	\N	\N	hot	14x140
4745	Boulon Acier 14x140	BA14140	\N	\N	acier	14x140
4746	Boulon Brut 14x150	BB14150	\N	\N	none	14x150
4747	Boulon Zingué 14x150	BZ14150	\N	\N	cold	14x150
4748	Boulon Zingué à chaud 14x150	BZC14150	\N	\N	hot	14x150
4749	Boulon Acier 14x150	BA14150	\N	\N	acier	14x150
4750	Boulon Brut 14x160	BB14160	\N	\N	none	14x160
4751	Boulon Zingué 14x160	BZ14160	\N	\N	cold	14x160
4752	Boulon Zingué à chaud 14x160	BZC14160	\N	\N	hot	14x160
4753	Boulon Acier 14x160	BA14160	\N	\N	acier	14x160
4754	Boulon Brut 14x170	BB14170	\N	\N	none	14x170
4755	Boulon Zingué 14x170	BZ14170	\N	\N	cold	14x170
4756	Boulon Zingué à chaud 14x170	BZC14170	\N	\N	hot	14x170
4757	Boulon Acier 14x170	BA14170	\N	\N	acier	14x170
4758	Boulon Brut 14x180	BB14180	\N	\N	none	14x180
4759	Boulon Zingué 14x180	BZ14180	\N	\N	cold	14x180
4760	Boulon Zingué à chaud 14x180	BZC14180	\N	\N	hot	14x180
4761	Boulon Acier 14x180	BA14180	\N	\N	acier	14x180
4762	Boulon Brut 14x190	BB14190	\N	\N	none	14x190
4763	Boulon Zingué 14x190	BZ14190	\N	\N	cold	14x190
4764	Boulon Zingué à chaud 14x190	BZC14190	\N	\N	hot	14x190
4765	Boulon Acier 14x190	BA14190	\N	\N	acier	14x190
4766	Boulon Brut 14x200	BB14200	\N	\N	none	14x200
4767	Boulon Zingué 14x200	BZ14200	\N	\N	cold	14x200
4768	Boulon Zingué à chaud 14x200	BZC14200	\N	\N	hot	14x200
4769	Boulon Acier 14x200	BA14200	\N	\N	acier	14x200
4770	Boulon Brut 16x12	BB1612	\N	\N	none	16x12
4771	Boulon Zingué 16x12	BZ1612	\N	\N	cold	16x12
4772	Boulon Zingué à chaud 16x12	BZC1612	\N	\N	hot	16x12
4773	Boulon Acier 16x12	BA1612	\N	\N	acier	16x12
4774	Boulon Brut 16x16	BB1616	\N	\N	none	16x16
4775	Boulon Zingué 16x16	BZ1616	\N	\N	cold	16x16
4776	Boulon Zingué à chaud 16x16	BZC1616	\N	\N	hot	16x16
4777	Boulon Acier 16x16	BA1616	\N	\N	acier	16x16
4778	Boulon Brut 16x20	BB1620	\N	\N	none	16x20
4779	Boulon Zingué 16x20	BZ1620	\N	\N	cold	16x20
4780	Boulon Zingué à chaud 16x20	BZC1620	\N	\N	hot	16x20
4781	Boulon Acier 16x20	BA1620	\N	\N	acier	16x20
4782	Boulon Brut 16x25	BB1625	\N	\N	none	16x25
4783	Boulon Zingué 16x25	BZ1625	\N	\N	cold	16x25
4784	Boulon Zingué à chaud 16x25	BZC1625	\N	\N	hot	16x25
4785	Boulon Acier 16x25	BA1625	\N	\N	acier	16x25
4786	Boulon Brut 16x30	BB1630	\N	\N	none	16x30
4787	Boulon Zingué 16x30	BZ1630	\N	\N	cold	16x30
4788	Boulon Zingué à chaud 16x30	BZC1630	\N	\N	hot	16x30
4789	Boulon Acier 16x30	BA1630	\N	\N	acier	16x30
4790	Boulon Brut 16x35	BB1635	\N	\N	none	16x35
4791	Boulon Zingué 16x35	BZ1635	\N	\N	cold	16x35
4792	Boulon Zingué à chaud 16x35	BZC1635	\N	\N	hot	16x35
4793	Boulon Acier 16x35	BA1635	\N	\N	acier	16x35
4794	Boulon Brut 16x40	BB1640	\N	\N	none	16x40
4795	Boulon Zingué 16x40	BZ1640	\N	\N	cold	16x40
4796	Boulon Zingué à chaud 16x40	BZC1640	\N	\N	hot	16x40
4797	Boulon Acier 16x40	BA1640	\N	\N	acier	16x40
4798	Boulon Brut 16x45	BB1645	\N	\N	none	16x45
4799	Boulon Zingué 16x45	BZ1645	\N	\N	cold	16x45
4800	Boulon Zingué à chaud 16x45	BZC1645	\N	\N	hot	16x45
4801	Boulon Acier 16x45	BA1645	\N	\N	acier	16x45
4802	Boulon Brut 16x50	BB1650	\N	\N	none	16x50
4803	Boulon Zingué 16x50	BZ1650	\N	\N	cold	16x50
4804	Boulon Zingué à chaud 16x50	BZC1650	\N	\N	hot	16x50
4805	Boulon Acier 16x50	BA1650	\N	\N	acier	16x50
4806	Boulon Brut 16x55	BB1655	\N	\N	none	16x55
4807	Boulon Zingué 16x55	BZ1655	\N	\N	cold	16x55
4808	Boulon Zingué à chaud 16x55	BZC1655	\N	\N	hot	16x55
4809	Boulon Acier 16x55	BA1655	\N	\N	acier	16x55
4810	Boulon Brut 16x60	BB1660	\N	\N	none	16x60
4811	Boulon Zingué 16x60	BZ1660	\N	\N	cold	16x60
4812	Boulon Zingué à chaud 16x60	BZC1660	\N	\N	hot	16x60
4813	Boulon Acier 16x60	BA1660	\N	\N	acier	16x60
4814	Boulon Brut 16x65	BB1665	\N	\N	none	16x65
4815	Boulon Zingué 16x65	BZ1665	\N	\N	cold	16x65
4816	Boulon Zingué à chaud 16x65	BZC1665	\N	\N	hot	16x65
4817	Boulon Acier 16x65	BA1665	\N	\N	acier	16x65
4818	Boulon Brut 16x70	BB1670	\N	\N	none	16x70
4819	Boulon Zingué 16x70	BZ1670	\N	\N	cold	16x70
4820	Boulon Zingué à chaud 16x70	BZC1670	\N	\N	hot	16x70
4821	Boulon Acier 16x70	BA1670	\N	\N	acier	16x70
4822	Boulon Brut 16x75	BB1675	\N	\N	none	16x75
4823	Boulon Zingué 16x75	BZ1675	\N	\N	cold	16x75
4824	Boulon Zingué à chaud 16x75	BZC1675	\N	\N	hot	16x75
4825	Boulon Acier 16x75	BA1675	\N	\N	acier	16x75
4826	Boulon Brut 16x80	BB1680	\N	\N	none	16x80
4827	Boulon Zingué 16x80	BZ1680	\N	\N	cold	16x80
4828	Boulon Zingué à chaud 16x80	BZC1680	\N	\N	hot	16x80
4829	Boulon Acier 16x80	BA1680	\N	\N	acier	16x80
4830	Boulon Brut 16x85	BB1685	\N	\N	none	16x85
4831	Boulon Zingué 16x85	BZ1685	\N	\N	cold	16x85
4832	Boulon Zingué à chaud 16x85	BZC1685	\N	\N	hot	16x85
4833	Boulon Acier 16x85	BA1685	\N	\N	acier	16x85
4834	Boulon Brut 16x90	BB1690	\N	\N	none	16x90
4835	Boulon Zingué 16x90	BZ1690	\N	\N	cold	16x90
4836	Boulon Zingué à chaud 16x90	BZC1690	\N	\N	hot	16x90
4837	Boulon Acier 16x90	BA1690	\N	\N	acier	16x90
4838	Boulon Brut 16x100	BB16100	\N	\N	none	16x100
4839	Boulon Zingué 16x100	BZ16100	\N	\N	cold	16x100
4840	Boulon Zingué à chaud 16x100	BZC16100	\N	\N	hot	16x100
4841	Boulon Acier 16x100	BA16100	\N	\N	acier	16x100
4842	Boulon Brut 16x110	BB16110	\N	\N	none	16x110
4843	Boulon Zingué 16x110	BZ16110	\N	\N	cold	16x110
4844	Boulon Zingué à chaud 16x110	BZC16110	\N	\N	hot	16x110
4845	Boulon Acier 16x110	BA16110	\N	\N	acier	16x110
4846	Boulon Brut 16x120	BB16120	\N	\N	none	16x120
4847	Boulon Zingué 16x120	BZ16120	\N	\N	cold	16x120
4848	Boulon Zingué à chaud 16x120	BZC16120	\N	\N	hot	16x120
4849	Boulon Acier 16x120	BA16120	\N	\N	acier	16x120
4850	Boulon Brut 16x130	BB16130	\N	\N	none	16x130
4851	Boulon Zingué 16x130	BZ16130	\N	\N	cold	16x130
4852	Boulon Zingué à chaud 16x130	BZC16130	\N	\N	hot	16x130
4853	Boulon Acier 16x130	BA16130	\N	\N	acier	16x130
4854	Boulon Brut 16x140	BB16140	\N	\N	none	16x140
4855	Boulon Zingué 16x140	BZ16140	\N	\N	cold	16x140
4856	Boulon Zingué à chaud 16x140	BZC16140	\N	\N	hot	16x140
4857	Boulon Acier 16x140	BA16140	\N	\N	acier	16x140
4858	Boulon Brut 16x150	BB16150	\N	\N	none	16x150
4859	Boulon Zingué 16x150	BZ16150	\N	\N	cold	16x150
4860	Boulon Zingué à chaud 16x150	BZC16150	\N	\N	hot	16x150
4861	Boulon Acier 16x150	BA16150	\N	\N	acier	16x150
4862	Boulon Brut 16x160	BB16160	\N	\N	none	16x160
4863	Boulon Zingué 16x160	BZ16160	\N	\N	cold	16x160
4864	Boulon Zingué à chaud 16x160	BZC16160	\N	\N	hot	16x160
4865	Boulon Acier 16x160	BA16160	\N	\N	acier	16x160
4866	Boulon Brut 16x170	BB16170	\N	\N	none	16x170
4867	Boulon Zingué 16x170	BZ16170	\N	\N	cold	16x170
4868	Boulon Zingué à chaud 16x170	BZC16170	\N	\N	hot	16x170
4869	Boulon Acier 16x170	BA16170	\N	\N	acier	16x170
4870	Boulon Brut 16x180	BB16180	\N	\N	none	16x180
4871	Boulon Zingué 16x180	BZ16180	\N	\N	cold	16x180
4872	Boulon Zingué à chaud 16x180	BZC16180	\N	\N	hot	16x180
4873	Boulon Acier 16x180	BA16180	\N	\N	acier	16x180
4874	Boulon Brut 16x190	BB16190	\N	\N	none	16x190
4875	Boulon Zingué 16x190	BZ16190	\N	\N	cold	16x190
4876	Boulon Zingué à chaud 16x190	BZC16190	\N	\N	hot	16x190
4877	Boulon Acier 16x190	BA16190	\N	\N	acier	16x190
4878	Boulon Brut 16x200	BB16200	\N	\N	none	16x200
4879	Boulon Zingué 16x200	BZ16200	\N	\N	cold	16x200
4880	Boulon Zingué à chaud 16x200	BZC16200	\N	\N	hot	16x200
4881	Boulon Acier 16x200	BA16200	\N	\N	acier	16x200
4882	Boulon Brut 18x12	BB1812	\N	\N	none	18x12
4883	Boulon Zingué 18x12	BZ1812	\N	\N	cold	18x12
4884	Boulon Zingué à chaud 18x12	BZC1812	\N	\N	hot	18x12
4885	Boulon Acier 18x12	BA1812	\N	\N	acier	18x12
4886	Boulon Brut 18x16	BB1816	\N	\N	none	18x16
4887	Boulon Zingué 18x16	BZ1816	\N	\N	cold	18x16
4888	Boulon Zingué à chaud 18x16	BZC1816	\N	\N	hot	18x16
4889	Boulon Acier 18x16	BA1816	\N	\N	acier	18x16
4890	Boulon Brut 18x20	BB1820	\N	\N	none	18x20
4891	Boulon Zingué 18x20	BZ1820	\N	\N	cold	18x20
4892	Boulon Zingué à chaud 18x20	BZC1820	\N	\N	hot	18x20
4893	Boulon Acier 18x20	BA1820	\N	\N	acier	18x20
4894	Boulon Brut 18x25	BB1825	\N	\N	none	18x25
4895	Boulon Zingué 18x25	BZ1825	\N	\N	cold	18x25
4896	Boulon Zingué à chaud 18x25	BZC1825	\N	\N	hot	18x25
4897	Boulon Acier 18x25	BA1825	\N	\N	acier	18x25
4898	Boulon Brut 18x30	BB1830	\N	\N	none	18x30
4899	Boulon Zingué 18x30	BZ1830	\N	\N	cold	18x30
4900	Boulon Zingué à chaud 18x30	BZC1830	\N	\N	hot	18x30
4901	Boulon Acier 18x30	BA1830	\N	\N	acier	18x30
4902	Boulon Brut 18x35	BB1835	\N	\N	none	18x35
4903	Boulon Zingué 18x35	BZ1835	\N	\N	cold	18x35
4904	Boulon Zingué à chaud 18x35	BZC1835	\N	\N	hot	18x35
4905	Boulon Acier 18x35	BA1835	\N	\N	acier	18x35
4906	Boulon Brut 18x40	BB1840	\N	\N	none	18x40
4907	Boulon Zingué 18x40	BZ1840	\N	\N	cold	18x40
4908	Boulon Zingué à chaud 18x40	BZC1840	\N	\N	hot	18x40
4909	Boulon Acier 18x40	BA1840	\N	\N	acier	18x40
4910	Boulon Brut 18x45	BB1845	\N	\N	none	18x45
4911	Boulon Zingué 18x45	BZ1845	\N	\N	cold	18x45
4912	Boulon Zingué à chaud 18x45	BZC1845	\N	\N	hot	18x45
4913	Boulon Acier 18x45	BA1845	\N	\N	acier	18x45
4914	Boulon Brut 18x50	BB1850	\N	\N	none	18x50
4915	Boulon Zingué 18x50	BZ1850	\N	\N	cold	18x50
4916	Boulon Zingué à chaud 18x50	BZC1850	\N	\N	hot	18x50
4917	Boulon Acier 18x50	BA1850	\N	\N	acier	18x50
4918	Boulon Brut 18x55	BB1855	\N	\N	none	18x55
4919	Boulon Zingué 18x55	BZ1855	\N	\N	cold	18x55
4920	Boulon Zingué à chaud 18x55	BZC1855	\N	\N	hot	18x55
4921	Boulon Acier 18x55	BA1855	\N	\N	acier	18x55
4922	Boulon Brut 18x60	BB1860	\N	\N	none	18x60
4923	Boulon Zingué 18x60	BZ1860	\N	\N	cold	18x60
4924	Boulon Zingué à chaud 18x60	BZC1860	\N	\N	hot	18x60
4925	Boulon Acier 18x60	BA1860	\N	\N	acier	18x60
4926	Boulon Brut 18x65	BB1865	\N	\N	none	18x65
4927	Boulon Zingué 18x65	BZ1865	\N	\N	cold	18x65
4928	Boulon Zingué à chaud 18x65	BZC1865	\N	\N	hot	18x65
4929	Boulon Acier 18x65	BA1865	\N	\N	acier	18x65
4930	Boulon Brut 18x70	BB1870	\N	\N	none	18x70
4931	Boulon Zingué 18x70	BZ1870	\N	\N	cold	18x70
4932	Boulon Zingué à chaud 18x70	BZC1870	\N	\N	hot	18x70
4933	Boulon Acier 18x70	BA1870	\N	\N	acier	18x70
4934	Boulon Brut 18x75	BB1875	\N	\N	none	18x75
4935	Boulon Zingué 18x75	BZ1875	\N	\N	cold	18x75
4936	Boulon Zingué à chaud 18x75	BZC1875	\N	\N	hot	18x75
4937	Boulon Acier 18x75	BA1875	\N	\N	acier	18x75
4938	Boulon Brut 18x80	BB1880	\N	\N	none	18x80
4939	Boulon Zingué 18x80	BZ1880	\N	\N	cold	18x80
4940	Boulon Zingué à chaud 18x80	BZC1880	\N	\N	hot	18x80
4941	Boulon Acier 18x80	BA1880	\N	\N	acier	18x80
4942	Boulon Brut 18x85	BB1885	\N	\N	none	18x85
4943	Boulon Zingué 18x85	BZ1885	\N	\N	cold	18x85
4944	Boulon Zingué à chaud 18x85	BZC1885	\N	\N	hot	18x85
4945	Boulon Acier 18x85	BA1885	\N	\N	acier	18x85
4946	Boulon Brut 18x90	BB1890	\N	\N	none	18x90
4947	Boulon Zingué 18x90	BZ1890	\N	\N	cold	18x90
4948	Boulon Zingué à chaud 18x90	BZC1890	\N	\N	hot	18x90
4949	Boulon Acier 18x90	BA1890	\N	\N	acier	18x90
4950	Boulon Brut 18x100	BB18100	\N	\N	none	18x100
4951	Boulon Zingué 18x100	BZ18100	\N	\N	cold	18x100
4952	Boulon Zingué à chaud 18x100	BZC18100	\N	\N	hot	18x100
4953	Boulon Acier 18x100	BA18100	\N	\N	acier	18x100
4954	Boulon Brut 18x110	BB18110	\N	\N	none	18x110
4955	Boulon Zingué 18x110	BZ18110	\N	\N	cold	18x110
4956	Boulon Zingué à chaud 18x110	BZC18110	\N	\N	hot	18x110
4957	Boulon Acier 18x110	BA18110	\N	\N	acier	18x110
4958	Boulon Brut 18x120	BB18120	\N	\N	none	18x120
4959	Boulon Zingué 18x120	BZ18120	\N	\N	cold	18x120
4960	Boulon Zingué à chaud 18x120	BZC18120	\N	\N	hot	18x120
4961	Boulon Acier 18x120	BA18120	\N	\N	acier	18x120
4962	Boulon Brut 18x130	BB18130	\N	\N	none	18x130
4963	Boulon Zingué 18x130	BZ18130	\N	\N	cold	18x130
4964	Boulon Zingué à chaud 18x130	BZC18130	\N	\N	hot	18x130
4965	Boulon Acier 18x130	BA18130	\N	\N	acier	18x130
4966	Boulon Brut 18x140	BB18140	\N	\N	none	18x140
4967	Boulon Zingué 18x140	BZ18140	\N	\N	cold	18x140
4968	Boulon Zingué à chaud 18x140	BZC18140	\N	\N	hot	18x140
4969	Boulon Acier 18x140	BA18140	\N	\N	acier	18x140
4970	Boulon Brut 18x150	BB18150	\N	\N	none	18x150
4971	Boulon Zingué 18x150	BZ18150	\N	\N	cold	18x150
4972	Boulon Zingué à chaud 18x150	BZC18150	\N	\N	hot	18x150
4973	Boulon Acier 18x150	BA18150	\N	\N	acier	18x150
4974	Boulon Brut 18x160	BB18160	\N	\N	none	18x160
4975	Boulon Zingué 18x160	BZ18160	\N	\N	cold	18x160
4976	Boulon Zingué à chaud 18x160	BZC18160	\N	\N	hot	18x160
4977	Boulon Acier 18x160	BA18160	\N	\N	acier	18x160
4978	Boulon Brut 18x170	BB18170	\N	\N	none	18x170
4979	Boulon Zingué 18x170	BZ18170	\N	\N	cold	18x170
4980	Boulon Zingué à chaud 18x170	BZC18170	\N	\N	hot	18x170
4981	Boulon Acier 18x170	BA18170	\N	\N	acier	18x170
4982	Boulon Brut 18x180	BB18180	\N	\N	none	18x180
4983	Boulon Zingué 18x180	BZ18180	\N	\N	cold	18x180
4984	Boulon Zingué à chaud 18x180	BZC18180	\N	\N	hot	18x180
4985	Boulon Acier 18x180	BA18180	\N	\N	acier	18x180
4986	Boulon Brut 18x190	BB18190	\N	\N	none	18x190
4987	Boulon Zingué 18x190	BZ18190	\N	\N	cold	18x190
4988	Boulon Zingué à chaud 18x190	BZC18190	\N	\N	hot	18x190
4989	Boulon Acier 18x190	BA18190	\N	\N	acier	18x190
4990	Boulon Brut 18x200	BB18200	\N	\N	none	18x200
4991	Boulon Zingué 18x200	BZ18200	\N	\N	cold	18x200
4992	Boulon Zingué à chaud 18x200	BZC18200	\N	\N	hot	18x200
4993	Boulon Acier 18x200	BA18200	\N	\N	acier	18x200
4994	Boulon Brut 20x12	BB2012	\N	\N	none	20x12
4995	Boulon Zingué 20x12	BZ2012	\N	\N	cold	20x12
4996	Boulon Zingué à chaud 20x12	BZC2012	\N	\N	hot	20x12
4997	Boulon Acier 20x12	BA2012	\N	\N	acier	20x12
4998	Boulon Brut 20x16	BB2016	\N	\N	none	20x16
4999	Boulon Zingué 20x16	BZ2016	\N	\N	cold	20x16
5000	Boulon Zingué à chaud 20x16	BZC2016	\N	\N	hot	20x16
5001	Boulon Acier 20x16	BA2016	\N	\N	acier	20x16
5002	Boulon Brut 20x20	BB2020	\N	\N	none	20x20
5003	Boulon Zingué 20x20	BZ2020	\N	\N	cold	20x20
5004	Boulon Zingué à chaud 20x20	BZC2020	\N	\N	hot	20x20
5005	Boulon Acier 20x20	BA2020	\N	\N	acier	20x20
5006	Boulon Brut 20x25	BB2025	\N	\N	none	20x25
5007	Boulon Zingué 20x25	BZ2025	\N	\N	cold	20x25
5008	Boulon Zingué à chaud 20x25	BZC2025	\N	\N	hot	20x25
5009	Boulon Acier 20x25	BA2025	\N	\N	acier	20x25
5010	Boulon Brut 20x30	BB2030	\N	\N	none	20x30
5011	Boulon Zingué 20x30	BZ2030	\N	\N	cold	20x30
5012	Boulon Zingué à chaud 20x30	BZC2030	\N	\N	hot	20x30
5013	Boulon Acier 20x30	BA2030	\N	\N	acier	20x30
5014	Boulon Brut 20x35	BB2035	\N	\N	none	20x35
5015	Boulon Zingué 20x35	BZ2035	\N	\N	cold	20x35
5016	Boulon Zingué à chaud 20x35	BZC2035	\N	\N	hot	20x35
5017	Boulon Acier 20x35	BA2035	\N	\N	acier	20x35
5018	Boulon Brut 20x40	BB2040	\N	\N	none	20x40
5019	Boulon Zingué 20x40	BZ2040	\N	\N	cold	20x40
5020	Boulon Zingué à chaud 20x40	BZC2040	\N	\N	hot	20x40
5021	Boulon Acier 20x40	BA2040	\N	\N	acier	20x40
5022	Boulon Brut 20x45	BB2045	\N	\N	none	20x45
5023	Boulon Zingué 20x45	BZ2045	\N	\N	cold	20x45
5024	Boulon Zingué à chaud 20x45	BZC2045	\N	\N	hot	20x45
5025	Boulon Acier 20x45	BA2045	\N	\N	acier	20x45
5026	Boulon Brut 20x50	BB2050	\N	\N	none	20x50
5027	Boulon Zingué 20x50	BZ2050	\N	\N	cold	20x50
5028	Boulon Zingué à chaud 20x50	BZC2050	\N	\N	hot	20x50
5029	Boulon Acier 20x50	BA2050	\N	\N	acier	20x50
5030	Boulon Brut 20x55	BB2055	\N	\N	none	20x55
5031	Boulon Zingué 20x55	BZ2055	\N	\N	cold	20x55
5032	Boulon Zingué à chaud 20x55	BZC2055	\N	\N	hot	20x55
5033	Boulon Acier 20x55	BA2055	\N	\N	acier	20x55
5034	Boulon Brut 20x60	BB2060	\N	\N	none	20x60
5035	Boulon Zingué 20x60	BZ2060	\N	\N	cold	20x60
5036	Boulon Zingué à chaud 20x60	BZC2060	\N	\N	hot	20x60
5037	Boulon Acier 20x60	BA2060	\N	\N	acier	20x60
5038	Boulon Brut 20x65	BB2065	\N	\N	none	20x65
5039	Boulon Zingué 20x65	BZ2065	\N	\N	cold	20x65
5040	Boulon Zingué à chaud 20x65	BZC2065	\N	\N	hot	20x65
5041	Boulon Acier 20x65	BA2065	\N	\N	acier	20x65
5042	Boulon Brut 20x70	BB2070	\N	\N	none	20x70
5043	Boulon Zingué 20x70	BZ2070	\N	\N	cold	20x70
5044	Boulon Zingué à chaud 20x70	BZC2070	\N	\N	hot	20x70
5045	Boulon Acier 20x70	BA2070	\N	\N	acier	20x70
5046	Boulon Brut 20x75	BB2075	\N	\N	none	20x75
5047	Boulon Zingué 20x75	BZ2075	\N	\N	cold	20x75
5048	Boulon Zingué à chaud 20x75	BZC2075	\N	\N	hot	20x75
5049	Boulon Acier 20x75	BA2075	\N	\N	acier	20x75
5050	Boulon Brut 20x80	BB2080	\N	\N	none	20x80
5051	Boulon Zingué 20x80	BZ2080	\N	\N	cold	20x80
5052	Boulon Zingué à chaud 20x80	BZC2080	\N	\N	hot	20x80
5053	Boulon Acier 20x80	BA2080	\N	\N	acier	20x80
5054	Boulon Brut 20x85	BB2085	\N	\N	none	20x85
5055	Boulon Zingué 20x85	BZ2085	\N	\N	cold	20x85
5056	Boulon Zingué à chaud 20x85	BZC2085	\N	\N	hot	20x85
5057	Boulon Acier 20x85	BA2085	\N	\N	acier	20x85
5058	Boulon Brut 20x90	BB2090	\N	\N	none	20x90
5059	Boulon Zingué 20x90	BZ2090	\N	\N	cold	20x90
5060	Boulon Zingué à chaud 20x90	BZC2090	\N	\N	hot	20x90
5061	Boulon Acier 20x90	BA2090	\N	\N	acier	20x90
5062	Boulon Brut 20x100	BB20100	\N	\N	none	20x100
5063	Boulon Zingué 20x100	BZ20100	\N	\N	cold	20x100
5064	Boulon Zingué à chaud 20x100	BZC20100	\N	\N	hot	20x100
5065	Boulon Acier 20x100	BA20100	\N	\N	acier	20x100
5066	Boulon Brut 20x110	BB20110	\N	\N	none	20x110
5067	Boulon Zingué 20x110	BZ20110	\N	\N	cold	20x110
5068	Boulon Zingué à chaud 20x110	BZC20110	\N	\N	hot	20x110
5069	Boulon Acier 20x110	BA20110	\N	\N	acier	20x110
5070	Boulon Brut 20x120	BB20120	\N	\N	none	20x120
5071	Boulon Zingué 20x120	BZ20120	\N	\N	cold	20x120
5072	Boulon Zingué à chaud 20x120	BZC20120	\N	\N	hot	20x120
5073	Boulon Acier 20x120	BA20120	\N	\N	acier	20x120
5074	Boulon Brut 20x130	BB20130	\N	\N	none	20x130
5075	Boulon Zingué 20x130	BZ20130	\N	\N	cold	20x130
5076	Boulon Zingué à chaud 20x130	BZC20130	\N	\N	hot	20x130
5077	Boulon Acier 20x130	BA20130	\N	\N	acier	20x130
5078	Boulon Brut 20x140	BB20140	\N	\N	none	20x140
5079	Boulon Zingué 20x140	BZ20140	\N	\N	cold	20x140
5080	Boulon Zingué à chaud 20x140	BZC20140	\N	\N	hot	20x140
5081	Boulon Acier 20x140	BA20140	\N	\N	acier	20x140
5082	Boulon Brut 20x150	BB20150	\N	\N	none	20x150
5083	Boulon Zingué 20x150	BZ20150	\N	\N	cold	20x150
5084	Boulon Zingué à chaud 20x150	BZC20150	\N	\N	hot	20x150
5085	Boulon Acier 20x150	BA20150	\N	\N	acier	20x150
5086	Boulon Brut 20x160	BB20160	\N	\N	none	20x160
5087	Boulon Zingué 20x160	BZ20160	\N	\N	cold	20x160
5088	Boulon Zingué à chaud 20x160	BZC20160	\N	\N	hot	20x160
5089	Boulon Acier 20x160	BA20160	\N	\N	acier	20x160
5090	Boulon Brut 20x170	BB20170	\N	\N	none	20x170
5091	Boulon Zingué 20x170	BZ20170	\N	\N	cold	20x170
5092	Boulon Zingué à chaud 20x170	BZC20170	\N	\N	hot	20x170
5093	Boulon Acier 20x170	BA20170	\N	\N	acier	20x170
5094	Boulon Brut 20x180	BB20180	\N	\N	none	20x180
5095	Boulon Zingué 20x180	BZ20180	\N	\N	cold	20x180
5096	Boulon Zingué à chaud 20x180	BZC20180	\N	\N	hot	20x180
5097	Boulon Acier 20x180	BA20180	\N	\N	acier	20x180
5098	Boulon Brut 20x190	BB20190	\N	\N	none	20x190
5099	Boulon Zingué 20x190	BZ20190	\N	\N	cold	20x190
5100	Boulon Zingué à chaud 20x190	BZC20190	\N	\N	hot	20x190
5101	Boulon Acier 20x190	BA20190	\N	\N	acier	20x190
5102	Boulon Brut 20x200	BB20200	\N	\N	none	20x200
5103	Boulon Zingué 20x200	BZ20200	\N	\N	cold	20x200
5104	Boulon Zingué à chaud 20x200	BZC20200	\N	\N	hot	20x200
5105	Boulon Acier 20x200	BA20200	\N	\N	acier	20x200
5106	Boulon Brut 22x12	BB2212	\N	\N	none	22x12
5107	Boulon Zingué 22x12	BZ2212	\N	\N	cold	22x12
5108	Boulon Zingué à chaud 22x12	BZC2212	\N	\N	hot	22x12
5109	Boulon Acier 22x12	BA2212	\N	\N	acier	22x12
5110	Boulon Brut 22x16	BB2216	\N	\N	none	22x16
5111	Boulon Zingué 22x16	BZ2216	\N	\N	cold	22x16
5112	Boulon Zingué à chaud 22x16	BZC2216	\N	\N	hot	22x16
5113	Boulon Acier 22x16	BA2216	\N	\N	acier	22x16
5114	Boulon Brut 22x20	BB2220	\N	\N	none	22x20
5115	Boulon Zingué 22x20	BZ2220	\N	\N	cold	22x20
5116	Boulon Zingué à chaud 22x20	BZC2220	\N	\N	hot	22x20
5117	Boulon Acier 22x20	BA2220	\N	\N	acier	22x20
5118	Boulon Brut 22x25	BB2225	\N	\N	none	22x25
5119	Boulon Zingué 22x25	BZ2225	\N	\N	cold	22x25
5120	Boulon Zingué à chaud 22x25	BZC2225	\N	\N	hot	22x25
5121	Boulon Acier 22x25	BA2225	\N	\N	acier	22x25
5122	Boulon Brut 22x30	BB2230	\N	\N	none	22x30
5123	Boulon Zingué 22x30	BZ2230	\N	\N	cold	22x30
5124	Boulon Zingué à chaud 22x30	BZC2230	\N	\N	hot	22x30
5125	Boulon Acier 22x30	BA2230	\N	\N	acier	22x30
5126	Boulon Brut 22x35	BB2235	\N	\N	none	22x35
5127	Boulon Zingué 22x35	BZ2235	\N	\N	cold	22x35
5128	Boulon Zingué à chaud 22x35	BZC2235	\N	\N	hot	22x35
5129	Boulon Acier 22x35	BA2235	\N	\N	acier	22x35
5130	Boulon Brut 22x40	BB2240	\N	\N	none	22x40
5131	Boulon Zingué 22x40	BZ2240	\N	\N	cold	22x40
5132	Boulon Zingué à chaud 22x40	BZC2240	\N	\N	hot	22x40
5133	Boulon Acier 22x40	BA2240	\N	\N	acier	22x40
5134	Boulon Brut 22x45	BB2245	\N	\N	none	22x45
5135	Boulon Zingué 22x45	BZ2245	\N	\N	cold	22x45
5136	Boulon Zingué à chaud 22x45	BZC2245	\N	\N	hot	22x45
5137	Boulon Acier 22x45	BA2245	\N	\N	acier	22x45
5138	Boulon Brut 22x50	BB2250	\N	\N	none	22x50
5139	Boulon Zingué 22x50	BZ2250	\N	\N	cold	22x50
5140	Boulon Zingué à chaud 22x50	BZC2250	\N	\N	hot	22x50
5141	Boulon Acier 22x50	BA2250	\N	\N	acier	22x50
5142	Boulon Brut 22x55	BB2255	\N	\N	none	22x55
5143	Boulon Zingué 22x55	BZ2255	\N	\N	cold	22x55
5144	Boulon Zingué à chaud 22x55	BZC2255	\N	\N	hot	22x55
5145	Boulon Acier 22x55	BA2255	\N	\N	acier	22x55
5146	Boulon Brut 22x60	BB2260	\N	\N	none	22x60
5147	Boulon Zingué 22x60	BZ2260	\N	\N	cold	22x60
5148	Boulon Zingué à chaud 22x60	BZC2260	\N	\N	hot	22x60
5149	Boulon Acier 22x60	BA2260	\N	\N	acier	22x60
5150	Boulon Brut 22x65	BB2265	\N	\N	none	22x65
5151	Boulon Zingué 22x65	BZ2265	\N	\N	cold	22x65
5152	Boulon Zingué à chaud 22x65	BZC2265	\N	\N	hot	22x65
5153	Boulon Acier 22x65	BA2265	\N	\N	acier	22x65
5154	Boulon Brut 22x70	BB2270	\N	\N	none	22x70
5155	Boulon Zingué 22x70	BZ2270	\N	\N	cold	22x70
5156	Boulon Zingué à chaud 22x70	BZC2270	\N	\N	hot	22x70
5157	Boulon Acier 22x70	BA2270	\N	\N	acier	22x70
5158	Boulon Brut 22x75	BB2275	\N	\N	none	22x75
5159	Boulon Zingué 22x75	BZ2275	\N	\N	cold	22x75
5160	Boulon Zingué à chaud 22x75	BZC2275	\N	\N	hot	22x75
5161	Boulon Acier 22x75	BA2275	\N	\N	acier	22x75
5162	Boulon Brut 22x80	BB2280	\N	\N	none	22x80
5163	Boulon Zingué 22x80	BZ2280	\N	\N	cold	22x80
5164	Boulon Zingué à chaud 22x80	BZC2280	\N	\N	hot	22x80
5165	Boulon Acier 22x80	BA2280	\N	\N	acier	22x80
5166	Boulon Brut 22x85	BB2285	\N	\N	none	22x85
5167	Boulon Zingué 22x85	BZ2285	\N	\N	cold	22x85
5168	Boulon Zingué à chaud 22x85	BZC2285	\N	\N	hot	22x85
5169	Boulon Acier 22x85	BA2285	\N	\N	acier	22x85
5170	Boulon Brut 22x90	BB2290	\N	\N	none	22x90
5171	Boulon Zingué 22x90	BZ2290	\N	\N	cold	22x90
5172	Boulon Zingué à chaud 22x90	BZC2290	\N	\N	hot	22x90
5173	Boulon Acier 22x90	BA2290	\N	\N	acier	22x90
5174	Boulon Brut 22x100	BB22100	\N	\N	none	22x100
5175	Boulon Zingué 22x100	BZ22100	\N	\N	cold	22x100
5176	Boulon Zingué à chaud 22x100	BZC22100	\N	\N	hot	22x100
5177	Boulon Acier 22x100	BA22100	\N	\N	acier	22x100
5178	Boulon Brut 22x110	BB22110	\N	\N	none	22x110
5179	Boulon Zingué 22x110	BZ22110	\N	\N	cold	22x110
5180	Boulon Zingué à chaud 22x110	BZC22110	\N	\N	hot	22x110
5181	Boulon Acier 22x110	BA22110	\N	\N	acier	22x110
5182	Boulon Brut 22x120	BB22120	\N	\N	none	22x120
5183	Boulon Zingué 22x120	BZ22120	\N	\N	cold	22x120
5184	Boulon Zingué à chaud 22x120	BZC22120	\N	\N	hot	22x120
5185	Boulon Acier 22x120	BA22120	\N	\N	acier	22x120
5186	Boulon Brut 22x130	BB22130	\N	\N	none	22x130
5187	Boulon Zingué 22x130	BZ22130	\N	\N	cold	22x130
5188	Boulon Zingué à chaud 22x130	BZC22130	\N	\N	hot	22x130
5189	Boulon Acier 22x130	BA22130	\N	\N	acier	22x130
5190	Boulon Brut 22x140	BB22140	\N	\N	none	22x140
5191	Boulon Zingué 22x140	BZ22140	\N	\N	cold	22x140
5192	Boulon Zingué à chaud 22x140	BZC22140	\N	\N	hot	22x140
5193	Boulon Acier 22x140	BA22140	\N	\N	acier	22x140
5194	Boulon Brut 22x150	BB22150	\N	\N	none	22x150
5195	Boulon Zingué 22x150	BZ22150	\N	\N	cold	22x150
5196	Boulon Zingué à chaud 22x150	BZC22150	\N	\N	hot	22x150
5197	Boulon Acier 22x150	BA22150	\N	\N	acier	22x150
5198	Boulon Brut 22x160	BB22160	\N	\N	none	22x160
5199	Boulon Zingué 22x160	BZ22160	\N	\N	cold	22x160
5200	Boulon Zingué à chaud 22x160	BZC22160	\N	\N	hot	22x160
5201	Boulon Acier 22x160	BA22160	\N	\N	acier	22x160
5202	Boulon Brut 22x170	BB22170	\N	\N	none	22x170
5203	Boulon Zingué 22x170	BZ22170	\N	\N	cold	22x170
5204	Boulon Zingué à chaud 22x170	BZC22170	\N	\N	hot	22x170
5205	Boulon Acier 22x170	BA22170	\N	\N	acier	22x170
5206	Boulon Brut 22x180	BB22180	\N	\N	none	22x180
5207	Boulon Zingué 22x180	BZ22180	\N	\N	cold	22x180
5208	Boulon Zingué à chaud 22x180	BZC22180	\N	\N	hot	22x180
5209	Boulon Acier 22x180	BA22180	\N	\N	acier	22x180
5210	Boulon Brut 22x190	BB22190	\N	\N	none	22x190
5211	Boulon Zingué 22x190	BZ22190	\N	\N	cold	22x190
5212	Boulon Zingué à chaud 22x190	BZC22190	\N	\N	hot	22x190
5213	Boulon Acier 22x190	BA22190	\N	\N	acier	22x190
5214	Boulon Brut 22x200	BB22200	\N	\N	none	22x200
5215	Boulon Zingué 22x200	BZ22200	\N	\N	cold	22x200
5216	Boulon Zingué à chaud 22x200	BZC22200	\N	\N	hot	22x200
5217	Boulon Acier 22x200	BA22200	\N	\N	acier	22x200
5218	Boulon Brut 24x12	BB2412	\N	\N	none	24x12
5219	Boulon Zingué 24x12	BZ2412	\N	\N	cold	24x12
5220	Boulon Zingué à chaud 24x12	BZC2412	\N	\N	hot	24x12
5221	Boulon Acier 24x12	BA2412	\N	\N	acier	24x12
5222	Boulon Brut 24x16	BB2416	\N	\N	none	24x16
5223	Boulon Zingué 24x16	BZ2416	\N	\N	cold	24x16
5224	Boulon Zingué à chaud 24x16	BZC2416	\N	\N	hot	24x16
5225	Boulon Acier 24x16	BA2416	\N	\N	acier	24x16
5226	Boulon Brut 24x20	BB2420	\N	\N	none	24x20
5227	Boulon Zingué 24x20	BZ2420	\N	\N	cold	24x20
5228	Boulon Zingué à chaud 24x20	BZC2420	\N	\N	hot	24x20
5229	Boulon Acier 24x20	BA2420	\N	\N	acier	24x20
5230	Boulon Brut 24x25	BB2425	\N	\N	none	24x25
5231	Boulon Zingué 24x25	BZ2425	\N	\N	cold	24x25
5232	Boulon Zingué à chaud 24x25	BZC2425	\N	\N	hot	24x25
5233	Boulon Acier 24x25	BA2425	\N	\N	acier	24x25
5234	Boulon Brut 24x30	BB2430	\N	\N	none	24x30
5235	Boulon Zingué 24x30	BZ2430	\N	\N	cold	24x30
5236	Boulon Zingué à chaud 24x30	BZC2430	\N	\N	hot	24x30
5237	Boulon Acier 24x30	BA2430	\N	\N	acier	24x30
5238	Boulon Brut 24x35	BB2435	\N	\N	none	24x35
5239	Boulon Zingué 24x35	BZ2435	\N	\N	cold	24x35
5240	Boulon Zingué à chaud 24x35	BZC2435	\N	\N	hot	24x35
5241	Boulon Acier 24x35	BA2435	\N	\N	acier	24x35
5242	Boulon Brut 24x40	BB2440	\N	\N	none	24x40
5243	Boulon Zingué 24x40	BZ2440	\N	\N	cold	24x40
5244	Boulon Zingué à chaud 24x40	BZC2440	\N	\N	hot	24x40
5245	Boulon Acier 24x40	BA2440	\N	\N	acier	24x40
5246	Boulon Brut 24x45	BB2445	\N	\N	none	24x45
5247	Boulon Zingué 24x45	BZ2445	\N	\N	cold	24x45
5248	Boulon Zingué à chaud 24x45	BZC2445	\N	\N	hot	24x45
5249	Boulon Acier 24x45	BA2445	\N	\N	acier	24x45
5250	Boulon Brut 24x50	BB2450	\N	\N	none	24x50
5251	Boulon Zingué 24x50	BZ2450	\N	\N	cold	24x50
5252	Boulon Zingué à chaud 24x50	BZC2450	\N	\N	hot	24x50
5253	Boulon Acier 24x50	BA2450	\N	\N	acier	24x50
5254	Boulon Brut 24x55	BB2455	\N	\N	none	24x55
5255	Boulon Zingué 24x55	BZ2455	\N	\N	cold	24x55
5256	Boulon Zingué à chaud 24x55	BZC2455	\N	\N	hot	24x55
5257	Boulon Acier 24x55	BA2455	\N	\N	acier	24x55
5258	Boulon Brut 24x60	BB2460	\N	\N	none	24x60
5259	Boulon Zingué 24x60	BZ2460	\N	\N	cold	24x60
5260	Boulon Zingué à chaud 24x60	BZC2460	\N	\N	hot	24x60
5261	Boulon Acier 24x60	BA2460	\N	\N	acier	24x60
5262	Boulon Brut 24x65	BB2465	\N	\N	none	24x65
5263	Boulon Zingué 24x65	BZ2465	\N	\N	cold	24x65
5264	Boulon Zingué à chaud 24x65	BZC2465	\N	\N	hot	24x65
5265	Boulon Acier 24x65	BA2465	\N	\N	acier	24x65
5266	Boulon Brut 24x70	BB2470	\N	\N	none	24x70
5267	Boulon Zingué 24x70	BZ2470	\N	\N	cold	24x70
5268	Boulon Zingué à chaud 24x70	BZC2470	\N	\N	hot	24x70
5269	Boulon Acier 24x70	BA2470	\N	\N	acier	24x70
5270	Boulon Brut 24x75	BB2475	\N	\N	none	24x75
5271	Boulon Zingué 24x75	BZ2475	\N	\N	cold	24x75
5272	Boulon Zingué à chaud 24x75	BZC2475	\N	\N	hot	24x75
5273	Boulon Acier 24x75	BA2475	\N	\N	acier	24x75
5274	Boulon Brut 24x80	BB2480	\N	\N	none	24x80
5275	Boulon Zingué 24x80	BZ2480	\N	\N	cold	24x80
5276	Boulon Zingué à chaud 24x80	BZC2480	\N	\N	hot	24x80
5277	Boulon Acier 24x80	BA2480	\N	\N	acier	24x80
5278	Boulon Brut 24x85	BB2485	\N	\N	none	24x85
5279	Boulon Zingué 24x85	BZ2485	\N	\N	cold	24x85
5280	Boulon Zingué à chaud 24x85	BZC2485	\N	\N	hot	24x85
5281	Boulon Acier 24x85	BA2485	\N	\N	acier	24x85
5282	Boulon Brut 24x90	BB2490	\N	\N	none	24x90
5283	Boulon Zingué 24x90	BZ2490	\N	\N	cold	24x90
5284	Boulon Zingué à chaud 24x90	BZC2490	\N	\N	hot	24x90
5285	Boulon Acier 24x90	BA2490	\N	\N	acier	24x90
5286	Boulon Brut 24x100	BB24100	\N	\N	none	24x100
5287	Boulon Zingué 24x100	BZ24100	\N	\N	cold	24x100
5288	Boulon Zingué à chaud 24x100	BZC24100	\N	\N	hot	24x100
5289	Boulon Acier 24x100	BA24100	\N	\N	acier	24x100
5290	Boulon Brut 24x110	BB24110	\N	\N	none	24x110
5291	Boulon Zingué 24x110	BZ24110	\N	\N	cold	24x110
5292	Boulon Zingué à chaud 24x110	BZC24110	\N	\N	hot	24x110
5293	Boulon Acier 24x110	BA24110	\N	\N	acier	24x110
5294	Boulon Brut 24x120	BB24120	\N	\N	none	24x120
5295	Boulon Zingué 24x120	BZ24120	\N	\N	cold	24x120
5296	Boulon Zingué à chaud 24x120	BZC24120	\N	\N	hot	24x120
5297	Boulon Acier 24x120	BA24120	\N	\N	acier	24x120
5298	Boulon Brut 24x130	BB24130	\N	\N	none	24x130
5299	Boulon Zingué 24x130	BZ24130	\N	\N	cold	24x130
5300	Boulon Zingué à chaud 24x130	BZC24130	\N	\N	hot	24x130
5301	Boulon Acier 24x130	BA24130	\N	\N	acier	24x130
5302	Boulon Brut 24x140	BB24140	\N	\N	none	24x140
5303	Boulon Zingué 24x140	BZ24140	\N	\N	cold	24x140
5304	Boulon Zingué à chaud 24x140	BZC24140	\N	\N	hot	24x140
5305	Boulon Acier 24x140	BA24140	\N	\N	acier	24x140
5306	Boulon Brut 24x150	BB24150	\N	\N	none	24x150
5307	Boulon Zingué 24x150	BZ24150	\N	\N	cold	24x150
5308	Boulon Zingué à chaud 24x150	BZC24150	\N	\N	hot	24x150
5309	Boulon Acier 24x150	BA24150	\N	\N	acier	24x150
5310	Boulon Brut 24x160	BB24160	\N	\N	none	24x160
5311	Boulon Zingué 24x160	BZ24160	\N	\N	cold	24x160
5312	Boulon Zingué à chaud 24x160	BZC24160	\N	\N	hot	24x160
5313	Boulon Acier 24x160	BA24160	\N	\N	acier	24x160
5314	Boulon Brut 24x170	BB24170	\N	\N	none	24x170
5315	Boulon Zingué 24x170	BZ24170	\N	\N	cold	24x170
5316	Boulon Zingué à chaud 24x170	BZC24170	\N	\N	hot	24x170
5317	Boulon Acier 24x170	BA24170	\N	\N	acier	24x170
5318	Boulon Brut 24x180	BB24180	\N	\N	none	24x180
5319	Boulon Zingué 24x180	BZ24180	\N	\N	cold	24x180
5320	Boulon Zingué à chaud 24x180	BZC24180	\N	\N	hot	24x180
5321	Boulon Acier 24x180	BA24180	\N	\N	acier	24x180
5322	Boulon Brut 24x190	BB24190	\N	\N	none	24x190
5323	Boulon Zingué 24x190	BZ24190	\N	\N	cold	24x190
5324	Boulon Zingué à chaud 24x190	BZC24190	\N	\N	hot	24x190
5325	Boulon Acier 24x190	BA24190	\N	\N	acier	24x190
5326	Boulon Brut 24x200	BB24200	\N	\N	none	24x200
5327	Boulon Zingué 24x200	BZ24200	\N	\N	cold	24x200
5328	Boulon Zingué à chaud 24x200	BZC24200	\N	\N	hot	24x200
5329	Boulon Acier 24x200	BA24200	\N	\N	acier	24x200
5330	Boulon Brut 27x12	BB2712	\N	\N	none	27x12
5331	Boulon Zingué 27x12	BZ2712	\N	\N	cold	27x12
5332	Boulon Zingué à chaud 27x12	BZC2712	\N	\N	hot	27x12
5333	Boulon Acier 27x12	BA2712	\N	\N	acier	27x12
5334	Boulon Brut 27x16	BB2716	\N	\N	none	27x16
5335	Boulon Zingué 27x16	BZ2716	\N	\N	cold	27x16
5336	Boulon Zingué à chaud 27x16	BZC2716	\N	\N	hot	27x16
5337	Boulon Acier 27x16	BA2716	\N	\N	acier	27x16
5338	Boulon Brut 27x20	BB2720	\N	\N	none	27x20
5339	Boulon Zingué 27x20	BZ2720	\N	\N	cold	27x20
5340	Boulon Zingué à chaud 27x20	BZC2720	\N	\N	hot	27x20
5341	Boulon Acier 27x20	BA2720	\N	\N	acier	27x20
5342	Boulon Brut 27x25	BB2725	\N	\N	none	27x25
5343	Boulon Zingué 27x25	BZ2725	\N	\N	cold	27x25
5344	Boulon Zingué à chaud 27x25	BZC2725	\N	\N	hot	27x25
5345	Boulon Acier 27x25	BA2725	\N	\N	acier	27x25
5346	Boulon Brut 27x30	BB2730	\N	\N	none	27x30
5347	Boulon Zingué 27x30	BZ2730	\N	\N	cold	27x30
5348	Boulon Zingué à chaud 27x30	BZC2730	\N	\N	hot	27x30
5349	Boulon Acier 27x30	BA2730	\N	\N	acier	27x30
5350	Boulon Brut 27x35	BB2735	\N	\N	none	27x35
5351	Boulon Zingué 27x35	BZ2735	\N	\N	cold	27x35
5352	Boulon Zingué à chaud 27x35	BZC2735	\N	\N	hot	27x35
5353	Boulon Acier 27x35	BA2735	\N	\N	acier	27x35
5354	Boulon Brut 27x40	BB2740	\N	\N	none	27x40
5355	Boulon Zingué 27x40	BZ2740	\N	\N	cold	27x40
5356	Boulon Zingué à chaud 27x40	BZC2740	\N	\N	hot	27x40
5357	Boulon Acier 27x40	BA2740	\N	\N	acier	27x40
5358	Boulon Brut 27x45	BB2745	\N	\N	none	27x45
5359	Boulon Zingué 27x45	BZ2745	\N	\N	cold	27x45
5360	Boulon Zingué à chaud 27x45	BZC2745	\N	\N	hot	27x45
5361	Boulon Acier 27x45	BA2745	\N	\N	acier	27x45
5362	Boulon Brut 27x50	BB2750	\N	\N	none	27x50
5363	Boulon Zingué 27x50	BZ2750	\N	\N	cold	27x50
5364	Boulon Zingué à chaud 27x50	BZC2750	\N	\N	hot	27x50
5365	Boulon Acier 27x50	BA2750	\N	\N	acier	27x50
5366	Boulon Brut 27x55	BB2755	\N	\N	none	27x55
5367	Boulon Zingué 27x55	BZ2755	\N	\N	cold	27x55
5368	Boulon Zingué à chaud 27x55	BZC2755	\N	\N	hot	27x55
5369	Boulon Acier 27x55	BA2755	\N	\N	acier	27x55
5370	Boulon Brut 27x60	BB2760	\N	\N	none	27x60
5371	Boulon Zingué 27x60	BZ2760	\N	\N	cold	27x60
5372	Boulon Zingué à chaud 27x60	BZC2760	\N	\N	hot	27x60
5373	Boulon Acier 27x60	BA2760	\N	\N	acier	27x60
5374	Boulon Brut 27x65	BB2765	\N	\N	none	27x65
5375	Boulon Zingué 27x65	BZ2765	\N	\N	cold	27x65
5376	Boulon Zingué à chaud 27x65	BZC2765	\N	\N	hot	27x65
5377	Boulon Acier 27x65	BA2765	\N	\N	acier	27x65
5378	Boulon Brut 27x70	BB2770	\N	\N	none	27x70
5379	Boulon Zingué 27x70	BZ2770	\N	\N	cold	27x70
5380	Boulon Zingué à chaud 27x70	BZC2770	\N	\N	hot	27x70
5381	Boulon Acier 27x70	BA2770	\N	\N	acier	27x70
5382	Boulon Brut 27x75	BB2775	\N	\N	none	27x75
5383	Boulon Zingué 27x75	BZ2775	\N	\N	cold	27x75
5384	Boulon Zingué à chaud 27x75	BZC2775	\N	\N	hot	27x75
5385	Boulon Acier 27x75	BA2775	\N	\N	acier	27x75
5386	Boulon Brut 27x80	BB2780	\N	\N	none	27x80
5387	Boulon Zingué 27x80	BZ2780	\N	\N	cold	27x80
5388	Boulon Zingué à chaud 27x80	BZC2780	\N	\N	hot	27x80
5389	Boulon Acier 27x80	BA2780	\N	\N	acier	27x80
5390	Boulon Brut 27x85	BB2785	\N	\N	none	27x85
5391	Boulon Zingué 27x85	BZ2785	\N	\N	cold	27x85
5392	Boulon Zingué à chaud 27x85	BZC2785	\N	\N	hot	27x85
5393	Boulon Acier 27x85	BA2785	\N	\N	acier	27x85
5394	Boulon Brut 27x90	BB2790	\N	\N	none	27x90
5395	Boulon Zingué 27x90	BZ2790	\N	\N	cold	27x90
5396	Boulon Zingué à chaud 27x90	BZC2790	\N	\N	hot	27x90
5397	Boulon Acier 27x90	BA2790	\N	\N	acier	27x90
5398	Boulon Brut 27x100	BB27100	\N	\N	none	27x100
5399	Boulon Zingué 27x100	BZ27100	\N	\N	cold	27x100
5400	Boulon Zingué à chaud 27x100	BZC27100	\N	\N	hot	27x100
5401	Boulon Acier 27x100	BA27100	\N	\N	acier	27x100
5402	Boulon Brut 27x110	BB27110	\N	\N	none	27x110
5403	Boulon Zingué 27x110	BZ27110	\N	\N	cold	27x110
5404	Boulon Zingué à chaud 27x110	BZC27110	\N	\N	hot	27x110
5405	Boulon Acier 27x110	BA27110	\N	\N	acier	27x110
5406	Boulon Brut 27x120	BB27120	\N	\N	none	27x120
5407	Boulon Zingué 27x120	BZ27120	\N	\N	cold	27x120
5408	Boulon Zingué à chaud 27x120	BZC27120	\N	\N	hot	27x120
5409	Boulon Acier 27x120	BA27120	\N	\N	acier	27x120
5410	Boulon Brut 27x130	BB27130	\N	\N	none	27x130
5411	Boulon Zingué 27x130	BZ27130	\N	\N	cold	27x130
5412	Boulon Zingué à chaud 27x130	BZC27130	\N	\N	hot	27x130
5413	Boulon Acier 27x130	BA27130	\N	\N	acier	27x130
5414	Boulon Brut 27x140	BB27140	\N	\N	none	27x140
5415	Boulon Zingué 27x140	BZ27140	\N	\N	cold	27x140
5416	Boulon Zingué à chaud 27x140	BZC27140	\N	\N	hot	27x140
5417	Boulon Acier 27x140	BA27140	\N	\N	acier	27x140
5418	Boulon Brut 27x150	BB27150	\N	\N	none	27x150
5419	Boulon Zingué 27x150	BZ27150	\N	\N	cold	27x150
5420	Boulon Zingué à chaud 27x150	BZC27150	\N	\N	hot	27x150
5421	Boulon Acier 27x150	BA27150	\N	\N	acier	27x150
5422	Boulon Brut 27x160	BB27160	\N	\N	none	27x160
5423	Boulon Zingué 27x160	BZ27160	\N	\N	cold	27x160
5424	Boulon Zingué à chaud 27x160	BZC27160	\N	\N	hot	27x160
5425	Boulon Acier 27x160	BA27160	\N	\N	acier	27x160
5426	Boulon Brut 27x170	BB27170	\N	\N	none	27x170
5427	Boulon Zingué 27x170	BZ27170	\N	\N	cold	27x170
5428	Boulon Zingué à chaud 27x170	BZC27170	\N	\N	hot	27x170
5429	Boulon Acier 27x170	BA27170	\N	\N	acier	27x170
5430	Boulon Brut 27x180	BB27180	\N	\N	none	27x180
5431	Boulon Zingué 27x180	BZ27180	\N	\N	cold	27x180
5432	Boulon Zingué à chaud 27x180	BZC27180	\N	\N	hot	27x180
5433	Boulon Acier 27x180	BA27180	\N	\N	acier	27x180
5434	Boulon Brut 27x190	BB27190	\N	\N	none	27x190
5435	Boulon Zingué 27x190	BZ27190	\N	\N	cold	27x190
5436	Boulon Zingué à chaud 27x190	BZC27190	\N	\N	hot	27x190
5437	Boulon Acier 27x190	BA27190	\N	\N	acier	27x190
5438	Boulon Brut 27x200	BB27200	\N	\N	none	27x200
5439	Boulon Zingué 27x200	BZ27200	\N	\N	cold	27x200
5440	Boulon Zingué à chaud 27x200	BZC27200	\N	\N	hot	27x200
5441	Boulon Acier 27x200	BA27200	\N	\N	acier	27x200
5442	Boulon Brut 30x12	BB3012	\N	\N	none	30x12
5443	Boulon Zingué 30x12	BZ3012	\N	\N	cold	30x12
5444	Boulon Zingué à chaud 30x12	BZC3012	\N	\N	hot	30x12
5445	Boulon Acier 30x12	BA3012	\N	\N	acier	30x12
5446	Boulon Brut 30x16	BB3016	\N	\N	none	30x16
5447	Boulon Zingué 30x16	BZ3016	\N	\N	cold	30x16
5448	Boulon Zingué à chaud 30x16	BZC3016	\N	\N	hot	30x16
5449	Boulon Acier 30x16	BA3016	\N	\N	acier	30x16
5450	Boulon Brut 30x20	BB3020	\N	\N	none	30x20
5451	Boulon Zingué 30x20	BZ3020	\N	\N	cold	30x20
5452	Boulon Zingué à chaud 30x20	BZC3020	\N	\N	hot	30x20
5453	Boulon Acier 30x20	BA3020	\N	\N	acier	30x20
5454	Boulon Brut 30x25	BB3025	\N	\N	none	30x25
5455	Boulon Zingué 30x25	BZ3025	\N	\N	cold	30x25
5456	Boulon Zingué à chaud 30x25	BZC3025	\N	\N	hot	30x25
5457	Boulon Acier 30x25	BA3025	\N	\N	acier	30x25
5458	Boulon Brut 30x30	BB3030	\N	\N	none	30x30
5459	Boulon Zingué 30x30	BZ3030	\N	\N	cold	30x30
5460	Boulon Zingué à chaud 30x30	BZC3030	\N	\N	hot	30x30
5461	Boulon Acier 30x30	BA3030	\N	\N	acier	30x30
5462	Boulon Brut 30x35	BB3035	\N	\N	none	30x35
5463	Boulon Zingué 30x35	BZ3035	\N	\N	cold	30x35
5464	Boulon Zingué à chaud 30x35	BZC3035	\N	\N	hot	30x35
5465	Boulon Acier 30x35	BA3035	\N	\N	acier	30x35
5466	Boulon Brut 30x40	BB3040	\N	\N	none	30x40
5467	Boulon Zingué 30x40	BZ3040	\N	\N	cold	30x40
5468	Boulon Zingué à chaud 30x40	BZC3040	\N	\N	hot	30x40
5469	Boulon Acier 30x40	BA3040	\N	\N	acier	30x40
5470	Boulon Brut 30x45	BB3045	\N	\N	none	30x45
5471	Boulon Zingué 30x45	BZ3045	\N	\N	cold	30x45
5472	Boulon Zingué à chaud 30x45	BZC3045	\N	\N	hot	30x45
5473	Boulon Acier 30x45	BA3045	\N	\N	acier	30x45
5474	Boulon Brut 30x50	BB3050	\N	\N	none	30x50
5475	Boulon Zingué 30x50	BZ3050	\N	\N	cold	30x50
5476	Boulon Zingué à chaud 30x50	BZC3050	\N	\N	hot	30x50
5477	Boulon Acier 30x50	BA3050	\N	\N	acier	30x50
5478	Boulon Brut 30x55	BB3055	\N	\N	none	30x55
5479	Boulon Zingué 30x55	BZ3055	\N	\N	cold	30x55
5480	Boulon Zingué à chaud 30x55	BZC3055	\N	\N	hot	30x55
5481	Boulon Acier 30x55	BA3055	\N	\N	acier	30x55
5482	Boulon Brut 30x60	BB3060	\N	\N	none	30x60
5483	Boulon Zingué 30x60	BZ3060	\N	\N	cold	30x60
5484	Boulon Zingué à chaud 30x60	BZC3060	\N	\N	hot	30x60
5485	Boulon Acier 30x60	BA3060	\N	\N	acier	30x60
5486	Boulon Brut 30x65	BB3065	\N	\N	none	30x65
5487	Boulon Zingué 30x65	BZ3065	\N	\N	cold	30x65
5488	Boulon Zingué à chaud 30x65	BZC3065	\N	\N	hot	30x65
5489	Boulon Acier 30x65	BA3065	\N	\N	acier	30x65
5490	Boulon Brut 30x70	BB3070	\N	\N	none	30x70
5491	Boulon Zingué 30x70	BZ3070	\N	\N	cold	30x70
5492	Boulon Zingué à chaud 30x70	BZC3070	\N	\N	hot	30x70
5493	Boulon Acier 30x70	BA3070	\N	\N	acier	30x70
5494	Boulon Brut 30x75	BB3075	\N	\N	none	30x75
5495	Boulon Zingué 30x75	BZ3075	\N	\N	cold	30x75
5496	Boulon Zingué à chaud 30x75	BZC3075	\N	\N	hot	30x75
5497	Boulon Acier 30x75	BA3075	\N	\N	acier	30x75
5498	Boulon Brut 30x80	BB3080	\N	\N	none	30x80
5499	Boulon Zingué 30x80	BZ3080	\N	\N	cold	30x80
5500	Boulon Zingué à chaud 30x80	BZC3080	\N	\N	hot	30x80
5501	Boulon Acier 30x80	BA3080	\N	\N	acier	30x80
5502	Boulon Brut 30x85	BB3085	\N	\N	none	30x85
5503	Boulon Zingué 30x85	BZ3085	\N	\N	cold	30x85
5504	Boulon Zingué à chaud 30x85	BZC3085	\N	\N	hot	30x85
5505	Boulon Acier 30x85	BA3085	\N	\N	acier	30x85
5506	Boulon Brut 30x90	BB3090	\N	\N	none	30x90
5507	Boulon Zingué 30x90	BZ3090	\N	\N	cold	30x90
5508	Boulon Zingué à chaud 30x90	BZC3090	\N	\N	hot	30x90
5509	Boulon Acier 30x90	BA3090	\N	\N	acier	30x90
5510	Boulon Brut 30x100	BB30100	\N	\N	none	30x100
5511	Boulon Zingué 30x100	BZ30100	\N	\N	cold	30x100
5512	Boulon Zingué à chaud 30x100	BZC30100	\N	\N	hot	30x100
5513	Boulon Acier 30x100	BA30100	\N	\N	acier	30x100
5514	Boulon Brut 30x110	BB30110	\N	\N	none	30x110
5515	Boulon Zingué 30x110	BZ30110	\N	\N	cold	30x110
5516	Boulon Zingué à chaud 30x110	BZC30110	\N	\N	hot	30x110
5517	Boulon Acier 30x110	BA30110	\N	\N	acier	30x110
5518	Boulon Brut 30x120	BB30120	\N	\N	none	30x120
5519	Boulon Zingué 30x120	BZ30120	\N	\N	cold	30x120
5520	Boulon Zingué à chaud 30x120	BZC30120	\N	\N	hot	30x120
5521	Boulon Acier 30x120	BA30120	\N	\N	acier	30x120
5522	Boulon Brut 30x130	BB30130	\N	\N	none	30x130
5523	Boulon Zingué 30x130	BZ30130	\N	\N	cold	30x130
5524	Boulon Zingué à chaud 30x130	BZC30130	\N	\N	hot	30x130
5525	Boulon Acier 30x130	BA30130	\N	\N	acier	30x130
5526	Boulon Brut 30x140	BB30140	\N	\N	none	30x140
5527	Boulon Zingué 30x140	BZ30140	\N	\N	cold	30x140
5528	Boulon Zingué à chaud 30x140	BZC30140	\N	\N	hot	30x140
5529	Boulon Acier 30x140	BA30140	\N	\N	acier	30x140
5530	Boulon Brut 30x150	BB30150	\N	\N	none	30x150
5531	Boulon Zingué 30x150	BZ30150	\N	\N	cold	30x150
5532	Boulon Zingué à chaud 30x150	BZC30150	\N	\N	hot	30x150
5533	Boulon Acier 30x150	BA30150	\N	\N	acier	30x150
5534	Boulon Brut 30x160	BB30160	\N	\N	none	30x160
5535	Boulon Zingué 30x160	BZ30160	\N	\N	cold	30x160
5536	Boulon Zingué à chaud 30x160	BZC30160	\N	\N	hot	30x160
5537	Boulon Acier 30x160	BA30160	\N	\N	acier	30x160
5538	Boulon Brut 30x170	BB30170	\N	\N	none	30x170
5539	Boulon Zingué 30x170	BZ30170	\N	\N	cold	30x170
5540	Boulon Zingué à chaud 30x170	BZC30170	\N	\N	hot	30x170
5541	Boulon Acier 30x170	BA30170	\N	\N	acier	30x170
5542	Boulon Brut 30x180	BB30180	\N	\N	none	30x180
5543	Boulon Zingué 30x180	BZ30180	\N	\N	cold	30x180
5544	Boulon Zingué à chaud 30x180	BZC30180	\N	\N	hot	30x180
5545	Boulon Acier 30x180	BA30180	\N	\N	acier	30x180
5546	Boulon Brut 30x190	BB30190	\N	\N	none	30x190
5547	Boulon Zingué 30x190	BZ30190	\N	\N	cold	30x190
5548	Boulon Zingué à chaud 30x190	BZC30190	\N	\N	hot	30x190
5549	Boulon Acier 30x190	BA30190	\N	\N	acier	30x190
5550	Boulon Brut 30x200	BB30200	\N	\N	none	30x200
5551	Boulon Zingué 30x200	BZ30200	\N	\N	cold	30x200
5552	Boulon Zingué à chaud 30x200	BZC30200	\N	\N	hot	30x200
5553	Boulon Acier 30x200	BA30200	\N	\N	acier	30x200
5554	Boulon Poelier Brut 4x12	BPB412	\N	\N	none	4x12
5555	Boulon Poelier Zingué 4x12	BPZ412	\N	\N	cold	4x12
5556	Boulon Poelier Zingué à chaud 4x12	BPZC412	\N	\N	hot	4x12
5557	Boulon Poelier Acier 4x12	BPA412	\N	\N	acier	4x12
5558	Boulon Poelier Brut 4x16	BPB416	\N	\N	none	4x16
5559	Boulon Poelier Zingué 4x16	BPZ416	\N	\N	cold	4x16
5560	Boulon Poelier Zingué à chaud 4x16	BPZC416	\N	\N	hot	4x16
5561	Boulon Poelier Acier 4x16	BPA416	\N	\N	acier	4x16
5562	Boulon Poelier Brut 4x20	BPB420	\N	\N	none	4x20
5563	Boulon Poelier Zingué 4x20	BPZ420	\N	\N	cold	4x20
5564	Boulon Poelier Zingué à chaud 4x20	BPZC420	\N	\N	hot	4x20
5565	Boulon Poelier Acier 4x20	BPA420	\N	\N	acier	4x20
5566	Boulon Poelier Brut 4x25	BPB425	\N	\N	none	4x25
5567	Boulon Poelier Zingué 4x25	BPZ425	\N	\N	cold	4x25
5568	Boulon Poelier Zingué à chaud 4x25	BPZC425	\N	\N	hot	4x25
5569	Boulon Poelier Acier 4x25	BPA425	\N	\N	acier	4x25
5570	Boulon Poelier Brut 4x30	BPB430	\N	\N	none	4x30
5571	Boulon Poelier Zingué 4x30	BPZ430	\N	\N	cold	4x30
5572	Boulon Poelier Zingué à chaud 4x30	BPZC430	\N	\N	hot	4x30
5573	Boulon Poelier Acier 4x30	BPA430	\N	\N	acier	4x30
5574	Boulon Poelier Brut 4x35	BPB435	\N	\N	none	4x35
5575	Boulon Poelier Zingué 4x35	BPZ435	\N	\N	cold	4x35
5576	Boulon Poelier Zingué à chaud 4x35	BPZC435	\N	\N	hot	4x35
5577	Boulon Poelier Acier 4x35	BPA435	\N	\N	acier	4x35
5578	Boulon Poelier Brut 4x40	BPB440	\N	\N	none	4x40
5579	Boulon Poelier Zingué 4x40	BPZ440	\N	\N	cold	4x40
5580	Boulon Poelier Zingué à chaud 4x40	BPZC440	\N	\N	hot	4x40
5581	Boulon Poelier Acier 4x40	BPA440	\N	\N	acier	4x40
5582	Boulon Poelier Brut 4x45	BPB445	\N	\N	none	4x45
5583	Boulon Poelier Zingué 4x45	BPZ445	\N	\N	cold	4x45
5584	Boulon Poelier Zingué à chaud 4x45	BPZC445	\N	\N	hot	4x45
5585	Boulon Poelier Acier 4x45	BPA445	\N	\N	acier	4x45
5586	Boulon Poelier Brut 4x50	BPB450	\N	\N	none	4x50
5587	Boulon Poelier Zingué 4x50	BPZ450	\N	\N	cold	4x50
5588	Boulon Poelier Zingué à chaud 4x50	BPZC450	\N	\N	hot	4x50
5589	Boulon Poelier Acier 4x50	BPA450	\N	\N	acier	4x50
5590	Boulon Poelier Brut 4x55	BPB455	\N	\N	none	4x55
5591	Boulon Poelier Zingué 4x55	BPZ455	\N	\N	cold	4x55
5592	Boulon Poelier Zingué à chaud 4x55	BPZC455	\N	\N	hot	4x55
5593	Boulon Poelier Acier 4x55	BPA455	\N	\N	acier	4x55
5594	Boulon Poelier Brut 4x60	BPB460	\N	\N	none	4x60
5595	Boulon Poelier Zingué 4x60	BPZ460	\N	\N	cold	4x60
5596	Boulon Poelier Zingué à chaud 4x60	BPZC460	\N	\N	hot	4x60
5597	Boulon Poelier Acier 4x60	BPA460	\N	\N	acier	4x60
5598	Boulon Poelier Brut 4x65	BPB465	\N	\N	none	4x65
5599	Boulon Poelier Zingué 4x65	BPZ465	\N	\N	cold	4x65
5600	Boulon Poelier Zingué à chaud 4x65	BPZC465	\N	\N	hot	4x65
5601	Boulon Poelier Acier 4x65	BPA465	\N	\N	acier	4x65
5602	Boulon Poelier Brut 4x70	BPB470	\N	\N	none	4x70
5603	Boulon Poelier Zingué 4x70	BPZ470	\N	\N	cold	4x70
5604	Boulon Poelier Zingué à chaud 4x70	BPZC470	\N	\N	hot	4x70
5605	Boulon Poelier Acier 4x70	BPA470	\N	\N	acier	4x70
5606	Boulon Poelier Brut 4x75	BPB475	\N	\N	none	4x75
5607	Boulon Poelier Zingué 4x75	BPZ475	\N	\N	cold	4x75
5608	Boulon Poelier Zingué à chaud 4x75	BPZC475	\N	\N	hot	4x75
5609	Boulon Poelier Acier 4x75	BPA475	\N	\N	acier	4x75
5610	Boulon Poelier Brut 4x80	BPB480	\N	\N	none	4x80
5611	Boulon Poelier Zingué 4x80	BPZ480	\N	\N	cold	4x80
5612	Boulon Poelier Zingué à chaud 4x80	BPZC480	\N	\N	hot	4x80
5613	Boulon Poelier Acier 4x80	BPA480	\N	\N	acier	4x80
5614	Boulon Poelier Brut 4x85	BPB485	\N	\N	none	4x85
5615	Boulon Poelier Zingué 4x85	BPZ485	\N	\N	cold	4x85
5616	Boulon Poelier Zingué à chaud 4x85	BPZC485	\N	\N	hot	4x85
5617	Boulon Poelier Acier 4x85	BPA485	\N	\N	acier	4x85
5618	Boulon Poelier Brut 4x90	BPB490	\N	\N	none	4x90
5619	Boulon Poelier Zingué 4x90	BPZ490	\N	\N	cold	4x90
5620	Boulon Poelier Zingué à chaud 4x90	BPZC490	\N	\N	hot	4x90
5621	Boulon Poelier Acier 4x90	BPA490	\N	\N	acier	4x90
5622	Boulon Poelier Brut 4x100	BPB4100	\N	\N	none	4x100
5623	Boulon Poelier Zingué 4x100	BPZ4100	\N	\N	cold	4x100
5624	Boulon Poelier Zingué à chaud 4x100	BPZC4100	\N	\N	hot	4x100
5625	Boulon Poelier Acier 4x100	BPA4100	\N	\N	acier	4x100
5626	Boulon Poelier Brut 4x110	BPB4110	\N	\N	none	4x110
5627	Boulon Poelier Zingué 4x110	BPZ4110	\N	\N	cold	4x110
5628	Boulon Poelier Zingué à chaud 4x110	BPZC4110	\N	\N	hot	4x110
5629	Boulon Poelier Acier 4x110	BPA4110	\N	\N	acier	4x110
5630	Boulon Poelier Brut 4x120	BPB4120	\N	\N	none	4x120
5631	Boulon Poelier Zingué 4x120	BPZ4120	\N	\N	cold	4x120
5632	Boulon Poelier Zingué à chaud 4x120	BPZC4120	\N	\N	hot	4x120
5633	Boulon Poelier Acier 4x120	BPA4120	\N	\N	acier	4x120
5634	Boulon Poelier Brut 4x130	BPB4130	\N	\N	none	4x130
5635	Boulon Poelier Zingué 4x130	BPZ4130	\N	\N	cold	4x130
5636	Boulon Poelier Zingué à chaud 4x130	BPZC4130	\N	\N	hot	4x130
5637	Boulon Poelier Acier 4x130	BPA4130	\N	\N	acier	4x130
5638	Boulon Poelier Brut 4x140	BPB4140	\N	\N	none	4x140
5639	Boulon Poelier Zingué 4x140	BPZ4140	\N	\N	cold	4x140
5640	Boulon Poelier Zingué à chaud 4x140	BPZC4140	\N	\N	hot	4x140
5641	Boulon Poelier Acier 4x140	BPA4140	\N	\N	acier	4x140
5642	Boulon Poelier Brut 4x150	BPB4150	\N	\N	none	4x150
5643	Boulon Poelier Zingué 4x150	BPZ4150	\N	\N	cold	4x150
5644	Boulon Poelier Zingué à chaud 4x150	BPZC4150	\N	\N	hot	4x150
5645	Boulon Poelier Acier 4x150	BPA4150	\N	\N	acier	4x150
5646	Boulon Poelier Brut 5x12	BPB512	\N	\N	none	5x12
5647	Boulon Poelier Zingué 5x12	BPZ512	\N	\N	cold	5x12
5648	Boulon Poelier Zingué à chaud 5x12	BPZC512	\N	\N	hot	5x12
5649	Boulon Poelier Acier 5x12	BPA512	\N	\N	acier	5x12
5650	Boulon Poelier Brut 5x16	BPB516	\N	\N	none	5x16
5651	Boulon Poelier Zingué 5x16	BPZ516	\N	\N	cold	5x16
5652	Boulon Poelier Zingué à chaud 5x16	BPZC516	\N	\N	hot	5x16
5653	Boulon Poelier Acier 5x16	BPA516	\N	\N	acier	5x16
5654	Boulon Poelier Brut 5x20	BPB520	\N	\N	none	5x20
5655	Boulon Poelier Zingué 5x20	BPZ520	\N	\N	cold	5x20
5656	Boulon Poelier Zingué à chaud 5x20	BPZC520	\N	\N	hot	5x20
5657	Boulon Poelier Acier 5x20	BPA520	\N	\N	acier	5x20
5658	Boulon Poelier Brut 5x25	BPB525	\N	\N	none	5x25
5659	Boulon Poelier Zingué 5x25	BPZ525	\N	\N	cold	5x25
5660	Boulon Poelier Zingué à chaud 5x25	BPZC525	\N	\N	hot	5x25
5661	Boulon Poelier Acier 5x25	BPA525	\N	\N	acier	5x25
5662	Boulon Poelier Brut 5x30	BPB530	\N	\N	none	5x30
5663	Boulon Poelier Zingué 5x30	BPZ530	\N	\N	cold	5x30
5664	Boulon Poelier Zingué à chaud 5x30	BPZC530	\N	\N	hot	5x30
5665	Boulon Poelier Acier 5x30	BPA530	\N	\N	acier	5x30
5666	Boulon Poelier Brut 5x35	BPB535	\N	\N	none	5x35
5667	Boulon Poelier Zingué 5x35	BPZ535	\N	\N	cold	5x35
5668	Boulon Poelier Zingué à chaud 5x35	BPZC535	\N	\N	hot	5x35
5669	Boulon Poelier Acier 5x35	BPA535	\N	\N	acier	5x35
5670	Boulon Poelier Brut 5x40	BPB540	\N	\N	none	5x40
5671	Boulon Poelier Zingué 5x40	BPZ540	\N	\N	cold	5x40
5672	Boulon Poelier Zingué à chaud 5x40	BPZC540	\N	\N	hot	5x40
5673	Boulon Poelier Acier 5x40	BPA540	\N	\N	acier	5x40
5674	Boulon Poelier Brut 5x45	BPB545	\N	\N	none	5x45
5675	Boulon Poelier Zingué 5x45	BPZ545	\N	\N	cold	5x45
5676	Boulon Poelier Zingué à chaud 5x45	BPZC545	\N	\N	hot	5x45
5677	Boulon Poelier Acier 5x45	BPA545	\N	\N	acier	5x45
5678	Boulon Poelier Brut 5x50	BPB550	\N	\N	none	5x50
5679	Boulon Poelier Zingué 5x50	BPZ550	\N	\N	cold	5x50
5680	Boulon Poelier Zingué à chaud 5x50	BPZC550	\N	\N	hot	5x50
5681	Boulon Poelier Acier 5x50	BPA550	\N	\N	acier	5x50
5682	Boulon Poelier Brut 5x55	BPB555	\N	\N	none	5x55
5683	Boulon Poelier Zingué 5x55	BPZ555	\N	\N	cold	5x55
5684	Boulon Poelier Zingué à chaud 5x55	BPZC555	\N	\N	hot	5x55
5685	Boulon Poelier Acier 5x55	BPA555	\N	\N	acier	5x55
5686	Boulon Poelier Brut 5x60	BPB560	\N	\N	none	5x60
5687	Boulon Poelier Zingué 5x60	BPZ560	\N	\N	cold	5x60
5688	Boulon Poelier Zingué à chaud 5x60	BPZC560	\N	\N	hot	5x60
5689	Boulon Poelier Acier 5x60	BPA560	\N	\N	acier	5x60
5690	Boulon Poelier Brut 5x65	BPB565	\N	\N	none	5x65
5691	Boulon Poelier Zingué 5x65	BPZ565	\N	\N	cold	5x65
5692	Boulon Poelier Zingué à chaud 5x65	BPZC565	\N	\N	hot	5x65
5693	Boulon Poelier Acier 5x65	BPA565	\N	\N	acier	5x65
5694	Boulon Poelier Brut 5x70	BPB570	\N	\N	none	5x70
5695	Boulon Poelier Zingué 5x70	BPZ570	\N	\N	cold	5x70
5696	Boulon Poelier Zingué à chaud 5x70	BPZC570	\N	\N	hot	5x70
5697	Boulon Poelier Acier 5x70	BPA570	\N	\N	acier	5x70
5698	Boulon Poelier Brut 5x75	BPB575	\N	\N	none	5x75
5699	Boulon Poelier Zingué 5x75	BPZ575	\N	\N	cold	5x75
5700	Boulon Poelier Zingué à chaud 5x75	BPZC575	\N	\N	hot	5x75
5701	Boulon Poelier Acier 5x75	BPA575	\N	\N	acier	5x75
5702	Boulon Poelier Brut 5x80	BPB580	\N	\N	none	5x80
5703	Boulon Poelier Zingué 5x80	BPZ580	\N	\N	cold	5x80
5704	Boulon Poelier Zingué à chaud 5x80	BPZC580	\N	\N	hot	5x80
5705	Boulon Poelier Acier 5x80	BPA580	\N	\N	acier	5x80
5706	Boulon Poelier Brut 5x85	BPB585	\N	\N	none	5x85
5707	Boulon Poelier Zingué 5x85	BPZ585	\N	\N	cold	5x85
5708	Boulon Poelier Zingué à chaud 5x85	BPZC585	\N	\N	hot	5x85
5709	Boulon Poelier Acier 5x85	BPA585	\N	\N	acier	5x85
5710	Boulon Poelier Brut 5x90	BPB590	\N	\N	none	5x90
5711	Boulon Poelier Zingué 5x90	BPZ590	\N	\N	cold	5x90
5712	Boulon Poelier Zingué à chaud 5x90	BPZC590	\N	\N	hot	5x90
5713	Boulon Poelier Acier 5x90	BPA590	\N	\N	acier	5x90
5714	Boulon Poelier Brut 5x100	BPB5100	\N	\N	none	5x100
5715	Boulon Poelier Zingué 5x100	BPZ5100	\N	\N	cold	5x100
5716	Boulon Poelier Zingué à chaud 5x100	BPZC5100	\N	\N	hot	5x100
5717	Boulon Poelier Acier 5x100	BPA5100	\N	\N	acier	5x100
5718	Boulon Poelier Brut 5x110	BPB5110	\N	\N	none	5x110
5719	Boulon Poelier Zingué 5x110	BPZ5110	\N	\N	cold	5x110
5720	Boulon Poelier Zingué à chaud 5x110	BPZC5110	\N	\N	hot	5x110
5721	Boulon Poelier Acier 5x110	BPA5110	\N	\N	acier	5x110
5722	Boulon Poelier Brut 5x120	BPB5120	\N	\N	none	5x120
5723	Boulon Poelier Zingué 5x120	BPZ5120	\N	\N	cold	5x120
5724	Boulon Poelier Zingué à chaud 5x120	BPZC5120	\N	\N	hot	5x120
5725	Boulon Poelier Acier 5x120	BPA5120	\N	\N	acier	5x120
5726	Boulon Poelier Brut 5x130	BPB5130	\N	\N	none	5x130
5727	Boulon Poelier Zingué 5x130	BPZ5130	\N	\N	cold	5x130
5728	Boulon Poelier Zingué à chaud 5x130	BPZC5130	\N	\N	hot	5x130
5729	Boulon Poelier Acier 5x130	BPA5130	\N	\N	acier	5x130
5730	Boulon Poelier Brut 5x140	BPB5140	\N	\N	none	5x140
5731	Boulon Poelier Zingué 5x140	BPZ5140	\N	\N	cold	5x140
5732	Boulon Poelier Zingué à chaud 5x140	BPZC5140	\N	\N	hot	5x140
5733	Boulon Poelier Acier 5x140	BPA5140	\N	\N	acier	5x140
5734	Boulon Poelier Brut 5x150	BPB5150	\N	\N	none	5x150
5735	Boulon Poelier Zingué 5x150	BPZ5150	\N	\N	cold	5x150
5736	Boulon Poelier Zingué à chaud 5x150	BPZC5150	\N	\N	hot	5x150
5737	Boulon Poelier Acier 5x150	BPA5150	\N	\N	acier	5x150
5738	Boulon Poelier Brut 6x12	BPB612	\N	\N	none	6x12
5739	Boulon Poelier Zingué 6x12	BPZ612	\N	\N	cold	6x12
5740	Boulon Poelier Zingué à chaud 6x12	BPZC612	\N	\N	hot	6x12
5741	Boulon Poelier Acier 6x12	BPA612	\N	\N	acier	6x12
5742	Boulon Poelier Brut 6x16	BPB616	\N	\N	none	6x16
5743	Boulon Poelier Zingué 6x16	BPZ616	\N	\N	cold	6x16
5744	Boulon Poelier Zingué à chaud 6x16	BPZC616	\N	\N	hot	6x16
5745	Boulon Poelier Acier 6x16	BPA616	\N	\N	acier	6x16
5746	Boulon Poelier Brut 6x20	BPB620	\N	\N	none	6x20
5747	Boulon Poelier Zingué 6x20	BPZ620	\N	\N	cold	6x20
5748	Boulon Poelier Zingué à chaud 6x20	BPZC620	\N	\N	hot	6x20
5749	Boulon Poelier Acier 6x20	BPA620	\N	\N	acier	6x20
5750	Boulon Poelier Brut 6x25	BPB625	\N	\N	none	6x25
5751	Boulon Poelier Zingué 6x25	BPZ625	\N	\N	cold	6x25
5752	Boulon Poelier Zingué à chaud 6x25	BPZC625	\N	\N	hot	6x25
5753	Boulon Poelier Acier 6x25	BPA625	\N	\N	acier	6x25
5754	Boulon Poelier Brut 6x30	BPB630	\N	\N	none	6x30
5755	Boulon Poelier Zingué 6x30	BPZ630	\N	\N	cold	6x30
5756	Boulon Poelier Zingué à chaud 6x30	BPZC630	\N	\N	hot	6x30
5757	Boulon Poelier Acier 6x30	BPA630	\N	\N	acier	6x30
5758	Boulon Poelier Brut 6x35	BPB635	\N	\N	none	6x35
5759	Boulon Poelier Zingué 6x35	BPZ635	\N	\N	cold	6x35
5760	Boulon Poelier Zingué à chaud 6x35	BPZC635	\N	\N	hot	6x35
5761	Boulon Poelier Acier 6x35	BPA635	\N	\N	acier	6x35
5762	Boulon Poelier Brut 6x40	BPB640	\N	\N	none	6x40
5763	Boulon Poelier Zingué 6x40	BPZ640	\N	\N	cold	6x40
5764	Boulon Poelier Zingué à chaud 6x40	BPZC640	\N	\N	hot	6x40
5765	Boulon Poelier Acier 6x40	BPA640	\N	\N	acier	6x40
5766	Boulon Poelier Brut 6x45	BPB645	\N	\N	none	6x45
5767	Boulon Poelier Zingué 6x45	BPZ645	\N	\N	cold	6x45
5768	Boulon Poelier Zingué à chaud 6x45	BPZC645	\N	\N	hot	6x45
5769	Boulon Poelier Acier 6x45	BPA645	\N	\N	acier	6x45
5770	Boulon Poelier Brut 6x50	BPB650	\N	\N	none	6x50
5771	Boulon Poelier Zingué 6x50	BPZ650	\N	\N	cold	6x50
5772	Boulon Poelier Zingué à chaud 6x50	BPZC650	\N	\N	hot	6x50
5773	Boulon Poelier Acier 6x50	BPA650	\N	\N	acier	6x50
5774	Boulon Poelier Brut 6x55	BPB655	\N	\N	none	6x55
5775	Boulon Poelier Zingué 6x55	BPZ655	\N	\N	cold	6x55
5776	Boulon Poelier Zingué à chaud 6x55	BPZC655	\N	\N	hot	6x55
5777	Boulon Poelier Acier 6x55	BPA655	\N	\N	acier	6x55
5778	Boulon Poelier Brut 6x60	BPB660	\N	\N	none	6x60
5779	Boulon Poelier Zingué 6x60	BPZ660	\N	\N	cold	6x60
5780	Boulon Poelier Zingué à chaud 6x60	BPZC660	\N	\N	hot	6x60
5781	Boulon Poelier Acier 6x60	BPA660	\N	\N	acier	6x60
5782	Boulon Poelier Brut 6x65	BPB665	\N	\N	none	6x65
5783	Boulon Poelier Zingué 6x65	BPZ665	\N	\N	cold	6x65
5784	Boulon Poelier Zingué à chaud 6x65	BPZC665	\N	\N	hot	6x65
5785	Boulon Poelier Acier 6x65	BPA665	\N	\N	acier	6x65
5786	Boulon Poelier Brut 6x70	BPB670	\N	\N	none	6x70
5787	Boulon Poelier Zingué 6x70	BPZ670	\N	\N	cold	6x70
5788	Boulon Poelier Zingué à chaud 6x70	BPZC670	\N	\N	hot	6x70
5789	Boulon Poelier Acier 6x70	BPA670	\N	\N	acier	6x70
5790	Boulon Poelier Brut 6x75	BPB675	\N	\N	none	6x75
5791	Boulon Poelier Zingué 6x75	BPZ675	\N	\N	cold	6x75
5792	Boulon Poelier Zingué à chaud 6x75	BPZC675	\N	\N	hot	6x75
5793	Boulon Poelier Acier 6x75	BPA675	\N	\N	acier	6x75
5794	Boulon Poelier Brut 6x80	BPB680	\N	\N	none	6x80
5795	Boulon Poelier Zingué 6x80	BPZ680	\N	\N	cold	6x80
5796	Boulon Poelier Zingué à chaud 6x80	BPZC680	\N	\N	hot	6x80
5797	Boulon Poelier Acier 6x80	BPA680	\N	\N	acier	6x80
5798	Boulon Poelier Brut 6x85	BPB685	\N	\N	none	6x85
5799	Boulon Poelier Zingué 6x85	BPZ685	\N	\N	cold	6x85
5800	Boulon Poelier Zingué à chaud 6x85	BPZC685	\N	\N	hot	6x85
5801	Boulon Poelier Acier 6x85	BPA685	\N	\N	acier	6x85
5802	Boulon Poelier Brut 6x90	BPB690	\N	\N	none	6x90
5803	Boulon Poelier Zingué 6x90	BPZ690	\N	\N	cold	6x90
5804	Boulon Poelier Zingué à chaud 6x90	BPZC690	\N	\N	hot	6x90
5805	Boulon Poelier Acier 6x90	BPA690	\N	\N	acier	6x90
5806	Boulon Poelier Brut 6x100	BPB6100	\N	\N	none	6x100
5807	Boulon Poelier Zingué 6x100	BPZ6100	\N	\N	cold	6x100
5808	Boulon Poelier Zingué à chaud 6x100	BPZC6100	\N	\N	hot	6x100
5809	Boulon Poelier Acier 6x100	BPA6100	\N	\N	acier	6x100
5810	Boulon Poelier Brut 6x110	BPB6110	\N	\N	none	6x110
5811	Boulon Poelier Zingué 6x110	BPZ6110	\N	\N	cold	6x110
5812	Boulon Poelier Zingué à chaud 6x110	BPZC6110	\N	\N	hot	6x110
5813	Boulon Poelier Acier 6x110	BPA6110	\N	\N	acier	6x110
5814	Boulon Poelier Brut 6x120	BPB6120	\N	\N	none	6x120
5815	Boulon Poelier Zingué 6x120	BPZ6120	\N	\N	cold	6x120
5816	Boulon Poelier Zingué à chaud 6x120	BPZC6120	\N	\N	hot	6x120
5817	Boulon Poelier Acier 6x120	BPA6120	\N	\N	acier	6x120
5818	Boulon Poelier Brut 6x130	BPB6130	\N	\N	none	6x130
5819	Boulon Poelier Zingué 6x130	BPZ6130	\N	\N	cold	6x130
5820	Boulon Poelier Zingué à chaud 6x130	BPZC6130	\N	\N	hot	6x130
5821	Boulon Poelier Acier 6x130	BPA6130	\N	\N	acier	6x130
5822	Boulon Poelier Brut 6x140	BPB6140	\N	\N	none	6x140
5823	Boulon Poelier Zingué 6x140	BPZ6140	\N	\N	cold	6x140
5824	Boulon Poelier Zingué à chaud 6x140	BPZC6140	\N	\N	hot	6x140
5825	Boulon Poelier Acier 6x140	BPA6140	\N	\N	acier	6x140
5826	Boulon Poelier Brut 6x150	BPB6150	\N	\N	none	6x150
5827	Boulon Poelier Zingué 6x150	BPZ6150	\N	\N	cold	6x150
5828	Boulon Poelier Zingué à chaud 6x150	BPZC6150	\N	\N	hot	6x150
5829	Boulon Poelier Acier 6x150	BPA6150	\N	\N	acier	6x150
5830	Boulon Poelier Brut 8x12	BPB812	\N	\N	none	8x12
5831	Boulon Poelier Zingué 8x12	BPZ812	\N	\N	cold	8x12
5832	Boulon Poelier Zingué à chaud 8x12	BPZC812	\N	\N	hot	8x12
5833	Boulon Poelier Acier 8x12	BPA812	\N	\N	acier	8x12
5834	Boulon Poelier Brut 8x16	BPB816	\N	\N	none	8x16
5835	Boulon Poelier Zingué 8x16	BPZ816	\N	\N	cold	8x16
5836	Boulon Poelier Zingué à chaud 8x16	BPZC816	\N	\N	hot	8x16
5837	Boulon Poelier Acier 8x16	BPA816	\N	\N	acier	8x16
5838	Boulon Poelier Brut 8x20	BPB820	\N	\N	none	8x20
5839	Boulon Poelier Zingué 8x20	BPZ820	\N	\N	cold	8x20
5840	Boulon Poelier Zingué à chaud 8x20	BPZC820	\N	\N	hot	8x20
5841	Boulon Poelier Acier 8x20	BPA820	\N	\N	acier	8x20
5842	Boulon Poelier Brut 8x25	BPB825	\N	\N	none	8x25
5843	Boulon Poelier Zingué 8x25	BPZ825	\N	\N	cold	8x25
5844	Boulon Poelier Zingué à chaud 8x25	BPZC825	\N	\N	hot	8x25
5845	Boulon Poelier Acier 8x25	BPA825	\N	\N	acier	8x25
5846	Boulon Poelier Brut 8x30	BPB830	\N	\N	none	8x30
5847	Boulon Poelier Zingué 8x30	BPZ830	\N	\N	cold	8x30
5848	Boulon Poelier Zingué à chaud 8x30	BPZC830	\N	\N	hot	8x30
5849	Boulon Poelier Acier 8x30	BPA830	\N	\N	acier	8x30
5850	Boulon Poelier Brut 8x35	BPB835	\N	\N	none	8x35
5851	Boulon Poelier Zingué 8x35	BPZ835	\N	\N	cold	8x35
5852	Boulon Poelier Zingué à chaud 8x35	BPZC835	\N	\N	hot	8x35
5853	Boulon Poelier Acier 8x35	BPA835	\N	\N	acier	8x35
5854	Boulon Poelier Brut 8x40	BPB840	\N	\N	none	8x40
5855	Boulon Poelier Zingué 8x40	BPZ840	\N	\N	cold	8x40
5856	Boulon Poelier Zingué à chaud 8x40	BPZC840	\N	\N	hot	8x40
5857	Boulon Poelier Acier 8x40	BPA840	\N	\N	acier	8x40
5858	Boulon Poelier Brut 8x45	BPB845	\N	\N	none	8x45
5859	Boulon Poelier Zingué 8x45	BPZ845	\N	\N	cold	8x45
5860	Boulon Poelier Zingué à chaud 8x45	BPZC845	\N	\N	hot	8x45
5861	Boulon Poelier Acier 8x45	BPA845	\N	\N	acier	8x45
5862	Boulon Poelier Brut 8x50	BPB850	\N	\N	none	8x50
5863	Boulon Poelier Zingué 8x50	BPZ850	\N	\N	cold	8x50
5864	Boulon Poelier Zingué à chaud 8x50	BPZC850	\N	\N	hot	8x50
5865	Boulon Poelier Acier 8x50	BPA850	\N	\N	acier	8x50
5866	Boulon Poelier Brut 8x55	BPB855	\N	\N	none	8x55
5867	Boulon Poelier Zingué 8x55	BPZ855	\N	\N	cold	8x55
5868	Boulon Poelier Zingué à chaud 8x55	BPZC855	\N	\N	hot	8x55
5869	Boulon Poelier Acier 8x55	BPA855	\N	\N	acier	8x55
5870	Boulon Poelier Brut 8x60	BPB860	\N	\N	none	8x60
5871	Boulon Poelier Zingué 8x60	BPZ860	\N	\N	cold	8x60
5872	Boulon Poelier Zingué à chaud 8x60	BPZC860	\N	\N	hot	8x60
5873	Boulon Poelier Acier 8x60	BPA860	\N	\N	acier	8x60
5874	Boulon Poelier Brut 8x65	BPB865	\N	\N	none	8x65
5875	Boulon Poelier Zingué 8x65	BPZ865	\N	\N	cold	8x65
5876	Boulon Poelier Zingué à chaud 8x65	BPZC865	\N	\N	hot	8x65
5877	Boulon Poelier Acier 8x65	BPA865	\N	\N	acier	8x65
5878	Boulon Poelier Brut 8x70	BPB870	\N	\N	none	8x70
5879	Boulon Poelier Zingué 8x70	BPZ870	\N	\N	cold	8x70
5880	Boulon Poelier Zingué à chaud 8x70	BPZC870	\N	\N	hot	8x70
5881	Boulon Poelier Acier 8x70	BPA870	\N	\N	acier	8x70
5882	Boulon Poelier Brut 8x75	BPB875	\N	\N	none	8x75
5883	Boulon Poelier Zingué 8x75	BPZ875	\N	\N	cold	8x75
5884	Boulon Poelier Zingué à chaud 8x75	BPZC875	\N	\N	hot	8x75
5885	Boulon Poelier Acier 8x75	BPA875	\N	\N	acier	8x75
5886	Boulon Poelier Brut 8x80	BPB880	\N	\N	none	8x80
5887	Boulon Poelier Zingué 8x80	BPZ880	\N	\N	cold	8x80
5888	Boulon Poelier Zingué à chaud 8x80	BPZC880	\N	\N	hot	8x80
5889	Boulon Poelier Acier 8x80	BPA880	\N	\N	acier	8x80
5890	Boulon Poelier Brut 8x85	BPB885	\N	\N	none	8x85
5891	Boulon Poelier Zingué 8x85	BPZ885	\N	\N	cold	8x85
5892	Boulon Poelier Zingué à chaud 8x85	BPZC885	\N	\N	hot	8x85
5893	Boulon Poelier Acier 8x85	BPA885	\N	\N	acier	8x85
5894	Boulon Poelier Brut 8x90	BPB890	\N	\N	none	8x90
5895	Boulon Poelier Zingué 8x90	BPZ890	\N	\N	cold	8x90
5896	Boulon Poelier Zingué à chaud 8x90	BPZC890	\N	\N	hot	8x90
5897	Boulon Poelier Acier 8x90	BPA890	\N	\N	acier	8x90
5898	Boulon Poelier Brut 8x100	BPB8100	\N	\N	none	8x100
5899	Boulon Poelier Zingué 8x100	BPZ8100	\N	\N	cold	8x100
5900	Boulon Poelier Zingué à chaud 8x100	BPZC8100	\N	\N	hot	8x100
5901	Boulon Poelier Acier 8x100	BPA8100	\N	\N	acier	8x100
5902	Boulon Poelier Brut 8x110	BPB8110	\N	\N	none	8x110
5903	Boulon Poelier Zingué 8x110	BPZ8110	\N	\N	cold	8x110
5904	Boulon Poelier Zingué à chaud 8x110	BPZC8110	\N	\N	hot	8x110
5905	Boulon Poelier Acier 8x110	BPA8110	\N	\N	acier	8x110
5906	Boulon Poelier Brut 8x120	BPB8120	\N	\N	none	8x120
5907	Boulon Poelier Zingué 8x120	BPZ8120	\N	\N	cold	8x120
5908	Boulon Poelier Zingué à chaud 8x120	BPZC8120	\N	\N	hot	8x120
5909	Boulon Poelier Acier 8x120	BPA8120	\N	\N	acier	8x120
5910	Boulon Poelier Brut 8x130	BPB8130	\N	\N	none	8x130
5911	Boulon Poelier Zingué 8x130	BPZ8130	\N	\N	cold	8x130
5912	Boulon Poelier Zingué à chaud 8x130	BPZC8130	\N	\N	hot	8x130
5913	Boulon Poelier Acier 8x130	BPA8130	\N	\N	acier	8x130
5914	Boulon Poelier Brut 8x140	BPB8140	\N	\N	none	8x140
5915	Boulon Poelier Zingué 8x140	BPZ8140	\N	\N	cold	8x140
5916	Boulon Poelier Zingué à chaud 8x140	BPZC8140	\N	\N	hot	8x140
5917	Boulon Poelier Acier 8x140	BPA8140	\N	\N	acier	8x140
5918	Boulon Poelier Brut 8x150	BPB8150	\N	\N	none	8x150
5919	Boulon Poelier Zingué 8x150	BPZ8150	\N	\N	cold	8x150
5920	Boulon Poelier Zingué à chaud 8x150	BPZC8150	\N	\N	hot	8x150
5921	Boulon Poelier Acier 8x150	BPA8150	\N	\N	acier	8x150
5922	Boulon Tête Fraisée Brut 4x12	BTFB412	\N	\N	none	4x12
5923	Boulon Tête Fraisée Zingué 4x12	BTFZ412	\N	\N	cold	4x12
5924	Boulon Tête Fraisée Zingué à chaud 4x12	BTFZC412	\N	\N	hot	4x12
5925	Boulon Tête Fraisée Acier 4x12	BTFA412	\N	\N	acier	4x12
5926	Boulon Tête Fraisée Brut 4x16	BTFB416	\N	\N	none	4x16
5927	Boulon Tête Fraisée Zingué 4x16	BTFZ416	\N	\N	cold	4x16
5928	Boulon Tête Fraisée Zingué à chaud 4x16	BTFZC416	\N	\N	hot	4x16
5929	Boulon Tête Fraisée Acier 4x16	BTFA416	\N	\N	acier	4x16
5930	Boulon Tête Fraisée Brut 4x20	BTFB420	\N	\N	none	4x20
5931	Boulon Tête Fraisée Zingué 4x20	BTFZ420	\N	\N	cold	4x20
5932	Boulon Tête Fraisée Zingué à chaud 4x20	BTFZC420	\N	\N	hot	4x20
5933	Boulon Tête Fraisée Acier 4x20	BTFA420	\N	\N	acier	4x20
5934	Boulon Tête Fraisée Brut 4x25	BTFB425	\N	\N	none	4x25
5935	Boulon Tête Fraisée Zingué 4x25	BTFZ425	\N	\N	cold	4x25
5936	Boulon Tête Fraisée Zingué à chaud 4x25	BTFZC425	\N	\N	hot	4x25
5937	Boulon Tête Fraisée Acier 4x25	BTFA425	\N	\N	acier	4x25
5938	Boulon Tête Fraisée Brut 4x30	BTFB430	\N	\N	none	4x30
5939	Boulon Tête Fraisée Zingué 4x30	BTFZ430	\N	\N	cold	4x30
5940	Boulon Tête Fraisée Zingué à chaud 4x30	BTFZC430	\N	\N	hot	4x30
5941	Boulon Tête Fraisée Acier 4x30	BTFA430	\N	\N	acier	4x30
5942	Boulon Tête Fraisée Brut 4x35	BTFB435	\N	\N	none	4x35
5943	Boulon Tête Fraisée Zingué 4x35	BTFZ435	\N	\N	cold	4x35
5944	Boulon Tête Fraisée Zingué à chaud 4x35	BTFZC435	\N	\N	hot	4x35
5945	Boulon Tête Fraisée Acier 4x35	BTFA435	\N	\N	acier	4x35
5946	Boulon Tête Fraisée Brut 4x40	BTFB440	\N	\N	none	4x40
5947	Boulon Tête Fraisée Zingué 4x40	BTFZ440	\N	\N	cold	4x40
5948	Boulon Tête Fraisée Zingué à chaud 4x40	BTFZC440	\N	\N	hot	4x40
5949	Boulon Tête Fraisée Acier 4x40	BTFA440	\N	\N	acier	4x40
5950	Boulon Tête Fraisée Brut 4x45	BTFB445	\N	\N	none	4x45
5951	Boulon Tête Fraisée Zingué 4x45	BTFZ445	\N	\N	cold	4x45
5952	Boulon Tête Fraisée Zingué à chaud 4x45	BTFZC445	\N	\N	hot	4x45
5953	Boulon Tête Fraisée Acier 4x45	BTFA445	\N	\N	acier	4x45
5954	Boulon Tête Fraisée Brut 4x50	BTFB450	\N	\N	none	4x50
5955	Boulon Tête Fraisée Zingué 4x50	BTFZ450	\N	\N	cold	4x50
5956	Boulon Tête Fraisée Zingué à chaud 4x50	BTFZC450	\N	\N	hot	4x50
5957	Boulon Tête Fraisée Acier 4x50	BTFA450	\N	\N	acier	4x50
5958	Boulon Tête Fraisée Brut 4x55	BTFB455	\N	\N	none	4x55
5959	Boulon Tête Fraisée Zingué 4x55	BTFZ455	\N	\N	cold	4x55
5960	Boulon Tête Fraisée Zingué à chaud 4x55	BTFZC455	\N	\N	hot	4x55
5961	Boulon Tête Fraisée Acier 4x55	BTFA455	\N	\N	acier	4x55
5962	Boulon Tête Fraisée Brut 4x60	BTFB460	\N	\N	none	4x60
5963	Boulon Tête Fraisée Zingué 4x60	BTFZ460	\N	\N	cold	4x60
5964	Boulon Tête Fraisée Zingué à chaud 4x60	BTFZC460	\N	\N	hot	4x60
5965	Boulon Tête Fraisée Acier 4x60	BTFA460	\N	\N	acier	4x60
5966	Boulon Tête Fraisée Brut 4x65	BTFB465	\N	\N	none	4x65
5967	Boulon Tête Fraisée Zingué 4x65	BTFZ465	\N	\N	cold	4x65
5968	Boulon Tête Fraisée Zingué à chaud 4x65	BTFZC465	\N	\N	hot	4x65
5969	Boulon Tête Fraisée Acier 4x65	BTFA465	\N	\N	acier	4x65
5970	Boulon Tête Fraisée Brut 4x70	BTFB470	\N	\N	none	4x70
5971	Boulon Tête Fraisée Zingué 4x70	BTFZ470	\N	\N	cold	4x70
5972	Boulon Tête Fraisée Zingué à chaud 4x70	BTFZC470	\N	\N	hot	4x70
5973	Boulon Tête Fraisée Acier 4x70	BTFA470	\N	\N	acier	4x70
5974	Boulon Tête Fraisée Brut 4x75	BTFB475	\N	\N	none	4x75
5975	Boulon Tête Fraisée Zingué 4x75	BTFZ475	\N	\N	cold	4x75
5976	Boulon Tête Fraisée Zingué à chaud 4x75	BTFZC475	\N	\N	hot	4x75
5977	Boulon Tête Fraisée Acier 4x75	BTFA475	\N	\N	acier	4x75
5978	Boulon Tête Fraisée Brut 4x80	BTFB480	\N	\N	none	4x80
5979	Boulon Tête Fraisée Zingué 4x80	BTFZ480	\N	\N	cold	4x80
5980	Boulon Tête Fraisée Zingué à chaud 4x80	BTFZC480	\N	\N	hot	4x80
5981	Boulon Tête Fraisée Acier 4x80	BTFA480	\N	\N	acier	4x80
5982	Boulon Tête Fraisée Brut 4x85	BTFB485	\N	\N	none	4x85
5983	Boulon Tête Fraisée Zingué 4x85	BTFZ485	\N	\N	cold	4x85
5984	Boulon Tête Fraisée Zingué à chaud 4x85	BTFZC485	\N	\N	hot	4x85
5985	Boulon Tête Fraisée Acier 4x85	BTFA485	\N	\N	acier	4x85
5986	Boulon Tête Fraisée Brut 4x90	BTFB490	\N	\N	none	4x90
5987	Boulon Tête Fraisée Zingué 4x90	BTFZ490	\N	\N	cold	4x90
5988	Boulon Tête Fraisée Zingué à chaud 4x90	BTFZC490	\N	\N	hot	4x90
5989	Boulon Tête Fraisée Acier 4x90	BTFA490	\N	\N	acier	4x90
5990	Boulon Tête Fraisée Brut 4x100	BTFB4100	\N	\N	none	4x100
5991	Boulon Tête Fraisée Zingué 4x100	BTFZ4100	\N	\N	cold	4x100
5992	Boulon Tête Fraisée Zingué à chaud 4x100	BTFZC4100	\N	\N	hot	4x100
5993	Boulon Tête Fraisée Acier 4x100	BTFA4100	\N	\N	acier	4x100
5994	Boulon Tête Fraisée Brut 4x110	BTFB4110	\N	\N	none	4x110
5995	Boulon Tête Fraisée Zingué 4x110	BTFZ4110	\N	\N	cold	4x110
5996	Boulon Tête Fraisée Zingué à chaud 4x110	BTFZC4110	\N	\N	hot	4x110
5997	Boulon Tête Fraisée Acier 4x110	BTFA4110	\N	\N	acier	4x110
5998	Boulon Tête Fraisée Brut 4x120	BTFB4120	\N	\N	none	4x120
5999	Boulon Tête Fraisée Zingué 4x120	BTFZ4120	\N	\N	cold	4x120
6000	Boulon Tête Fraisée Zingué à chaud 4x120	BTFZC4120	\N	\N	hot	4x120
6001	Boulon Tête Fraisée Acier 4x120	BTFA4120	\N	\N	acier	4x120
6002	Boulon Tête Fraisée Brut 4x130	BTFB4130	\N	\N	none	4x130
6003	Boulon Tête Fraisée Zingué 4x130	BTFZ4130	\N	\N	cold	4x130
6004	Boulon Tête Fraisée Zingué à chaud 4x130	BTFZC4130	\N	\N	hot	4x130
6005	Boulon Tête Fraisée Acier 4x130	BTFA4130	\N	\N	acier	4x130
6006	Boulon Tête Fraisée Brut 4x140	BTFB4140	\N	\N	none	4x140
6007	Boulon Tête Fraisée Zingué 4x140	BTFZ4140	\N	\N	cold	4x140
6008	Boulon Tête Fraisée Zingué à chaud 4x140	BTFZC4140	\N	\N	hot	4x140
6009	Boulon Tête Fraisée Acier 4x140	BTFA4140	\N	\N	acier	4x140
6010	Boulon Tête Fraisée Brut 4x150	BTFB4150	\N	\N	none	4x150
6011	Boulon Tête Fraisée Zingué 4x150	BTFZ4150	\N	\N	cold	4x150
6012	Boulon Tête Fraisée Zingué à chaud 4x150	BTFZC4150	\N	\N	hot	4x150
6013	Boulon Tête Fraisée Acier 4x150	BTFA4150	\N	\N	acier	4x150
6014	Boulon Tête Fraisée Brut 5x12	BTFB512	\N	\N	none	5x12
6015	Boulon Tête Fraisée Zingué 5x12	BTFZ512	\N	\N	cold	5x12
6016	Boulon Tête Fraisée Zingué à chaud 5x12	BTFZC512	\N	\N	hot	5x12
6017	Boulon Tête Fraisée Acier 5x12	BTFA512	\N	\N	acier	5x12
6018	Boulon Tête Fraisée Brut 5x16	BTFB516	\N	\N	none	5x16
6019	Boulon Tête Fraisée Zingué 5x16	BTFZ516	\N	\N	cold	5x16
6020	Boulon Tête Fraisée Zingué à chaud 5x16	BTFZC516	\N	\N	hot	5x16
6021	Boulon Tête Fraisée Acier 5x16	BTFA516	\N	\N	acier	5x16
6022	Boulon Tête Fraisée Brut 5x20	BTFB520	\N	\N	none	5x20
6023	Boulon Tête Fraisée Zingué 5x20	BTFZ520	\N	\N	cold	5x20
6024	Boulon Tête Fraisée Zingué à chaud 5x20	BTFZC520	\N	\N	hot	5x20
6025	Boulon Tête Fraisée Acier 5x20	BTFA520	\N	\N	acier	5x20
6026	Boulon Tête Fraisée Brut 5x25	BTFB525	\N	\N	none	5x25
6027	Boulon Tête Fraisée Zingué 5x25	BTFZ525	\N	\N	cold	5x25
6028	Boulon Tête Fraisée Zingué à chaud 5x25	BTFZC525	\N	\N	hot	5x25
6029	Boulon Tête Fraisée Acier 5x25	BTFA525	\N	\N	acier	5x25
6030	Boulon Tête Fraisée Brut 5x30	BTFB530	\N	\N	none	5x30
6031	Boulon Tête Fraisée Zingué 5x30	BTFZ530	\N	\N	cold	5x30
6032	Boulon Tête Fraisée Zingué à chaud 5x30	BTFZC530	\N	\N	hot	5x30
6033	Boulon Tête Fraisée Acier 5x30	BTFA530	\N	\N	acier	5x30
6034	Boulon Tête Fraisée Brut 5x35	BTFB535	\N	\N	none	5x35
6035	Boulon Tête Fraisée Zingué 5x35	BTFZ535	\N	\N	cold	5x35
6036	Boulon Tête Fraisée Zingué à chaud 5x35	BTFZC535	\N	\N	hot	5x35
6037	Boulon Tête Fraisée Acier 5x35	BTFA535	\N	\N	acier	5x35
6038	Boulon Tête Fraisée Brut 5x40	BTFB540	\N	\N	none	5x40
6039	Boulon Tête Fraisée Zingué 5x40	BTFZ540	\N	\N	cold	5x40
6040	Boulon Tête Fraisée Zingué à chaud 5x40	BTFZC540	\N	\N	hot	5x40
6041	Boulon Tête Fraisée Acier 5x40	BTFA540	\N	\N	acier	5x40
6042	Boulon Tête Fraisée Brut 5x45	BTFB545	\N	\N	none	5x45
6043	Boulon Tête Fraisée Zingué 5x45	BTFZ545	\N	\N	cold	5x45
6044	Boulon Tête Fraisée Zingué à chaud 5x45	BTFZC545	\N	\N	hot	5x45
6045	Boulon Tête Fraisée Acier 5x45	BTFA545	\N	\N	acier	5x45
6046	Boulon Tête Fraisée Brut 5x50	BTFB550	\N	\N	none	5x50
6047	Boulon Tête Fraisée Zingué 5x50	BTFZ550	\N	\N	cold	5x50
6048	Boulon Tête Fraisée Zingué à chaud 5x50	BTFZC550	\N	\N	hot	5x50
6049	Boulon Tête Fraisée Acier 5x50	BTFA550	\N	\N	acier	5x50
6050	Boulon Tête Fraisée Brut 5x55	BTFB555	\N	\N	none	5x55
6051	Boulon Tête Fraisée Zingué 5x55	BTFZ555	\N	\N	cold	5x55
6052	Boulon Tête Fraisée Zingué à chaud 5x55	BTFZC555	\N	\N	hot	5x55
6053	Boulon Tête Fraisée Acier 5x55	BTFA555	\N	\N	acier	5x55
6054	Boulon Tête Fraisée Brut 5x60	BTFB560	\N	\N	none	5x60
6055	Boulon Tête Fraisée Zingué 5x60	BTFZ560	\N	\N	cold	5x60
6056	Boulon Tête Fraisée Zingué à chaud 5x60	BTFZC560	\N	\N	hot	5x60
6057	Boulon Tête Fraisée Acier 5x60	BTFA560	\N	\N	acier	5x60
6058	Boulon Tête Fraisée Brut 5x65	BTFB565	\N	\N	none	5x65
6059	Boulon Tête Fraisée Zingué 5x65	BTFZ565	\N	\N	cold	5x65
6060	Boulon Tête Fraisée Zingué à chaud 5x65	BTFZC565	\N	\N	hot	5x65
6061	Boulon Tête Fraisée Acier 5x65	BTFA565	\N	\N	acier	5x65
6062	Boulon Tête Fraisée Brut 5x70	BTFB570	\N	\N	none	5x70
6063	Boulon Tête Fraisée Zingué 5x70	BTFZ570	\N	\N	cold	5x70
6064	Boulon Tête Fraisée Zingué à chaud 5x70	BTFZC570	\N	\N	hot	5x70
6065	Boulon Tête Fraisée Acier 5x70	BTFA570	\N	\N	acier	5x70
6066	Boulon Tête Fraisée Brut 5x75	BTFB575	\N	\N	none	5x75
6067	Boulon Tête Fraisée Zingué 5x75	BTFZ575	\N	\N	cold	5x75
6068	Boulon Tête Fraisée Zingué à chaud 5x75	BTFZC575	\N	\N	hot	5x75
6069	Boulon Tête Fraisée Acier 5x75	BTFA575	\N	\N	acier	5x75
6070	Boulon Tête Fraisée Brut 5x80	BTFB580	\N	\N	none	5x80
6071	Boulon Tête Fraisée Zingué 5x80	BTFZ580	\N	\N	cold	5x80
6072	Boulon Tête Fraisée Zingué à chaud 5x80	BTFZC580	\N	\N	hot	5x80
6073	Boulon Tête Fraisée Acier 5x80	BTFA580	\N	\N	acier	5x80
6074	Boulon Tête Fraisée Brut 5x85	BTFB585	\N	\N	none	5x85
6075	Boulon Tête Fraisée Zingué 5x85	BTFZ585	\N	\N	cold	5x85
6076	Boulon Tête Fraisée Zingué à chaud 5x85	BTFZC585	\N	\N	hot	5x85
6077	Boulon Tête Fraisée Acier 5x85	BTFA585	\N	\N	acier	5x85
6078	Boulon Tête Fraisée Brut 5x90	BTFB590	\N	\N	none	5x90
6079	Boulon Tête Fraisée Zingué 5x90	BTFZ590	\N	\N	cold	5x90
6080	Boulon Tête Fraisée Zingué à chaud 5x90	BTFZC590	\N	\N	hot	5x90
6081	Boulon Tête Fraisée Acier 5x90	BTFA590	\N	\N	acier	5x90
6082	Boulon Tête Fraisée Brut 5x100	BTFB5100	\N	\N	none	5x100
6083	Boulon Tête Fraisée Zingué 5x100	BTFZ5100	\N	\N	cold	5x100
6084	Boulon Tête Fraisée Zingué à chaud 5x100	BTFZC5100	\N	\N	hot	5x100
6085	Boulon Tête Fraisée Acier 5x100	BTFA5100	\N	\N	acier	5x100
6086	Boulon Tête Fraisée Brut 5x110	BTFB5110	\N	\N	none	5x110
6087	Boulon Tête Fraisée Zingué 5x110	BTFZ5110	\N	\N	cold	5x110
6088	Boulon Tête Fraisée Zingué à chaud 5x110	BTFZC5110	\N	\N	hot	5x110
6089	Boulon Tête Fraisée Acier 5x110	BTFA5110	\N	\N	acier	5x110
6090	Boulon Tête Fraisée Brut 5x120	BTFB5120	\N	\N	none	5x120
6091	Boulon Tête Fraisée Zingué 5x120	BTFZ5120	\N	\N	cold	5x120
6092	Boulon Tête Fraisée Zingué à chaud 5x120	BTFZC5120	\N	\N	hot	5x120
6093	Boulon Tête Fraisée Acier 5x120	BTFA5120	\N	\N	acier	5x120
6094	Boulon Tête Fraisée Brut 5x130	BTFB5130	\N	\N	none	5x130
6095	Boulon Tête Fraisée Zingué 5x130	BTFZ5130	\N	\N	cold	5x130
6096	Boulon Tête Fraisée Zingué à chaud 5x130	BTFZC5130	\N	\N	hot	5x130
6097	Boulon Tête Fraisée Acier 5x130	BTFA5130	\N	\N	acier	5x130
6098	Boulon Tête Fraisée Brut 5x140	BTFB5140	\N	\N	none	5x140
6099	Boulon Tête Fraisée Zingué 5x140	BTFZ5140	\N	\N	cold	5x140
6100	Boulon Tête Fraisée Zingué à chaud 5x140	BTFZC5140	\N	\N	hot	5x140
6101	Boulon Tête Fraisée Acier 5x140	BTFA5140	\N	\N	acier	5x140
6102	Boulon Tête Fraisée Brut 5x150	BTFB5150	\N	\N	none	5x150
6103	Boulon Tête Fraisée Zingué 5x150	BTFZ5150	\N	\N	cold	5x150
6104	Boulon Tête Fraisée Zingué à chaud 5x150	BTFZC5150	\N	\N	hot	5x150
6105	Boulon Tête Fraisée Acier 5x150	BTFA5150	\N	\N	acier	5x150
6106	Boulon Tête Fraisée Brut 6x12	BTFB612	\N	\N	none	6x12
6107	Boulon Tête Fraisée Zingué 6x12	BTFZ612	\N	\N	cold	6x12
6108	Boulon Tête Fraisée Zingué à chaud 6x12	BTFZC612	\N	\N	hot	6x12
6109	Boulon Tête Fraisée Acier 6x12	BTFA612	\N	\N	acier	6x12
6110	Boulon Tête Fraisée Brut 6x16	BTFB616	\N	\N	none	6x16
6111	Boulon Tête Fraisée Zingué 6x16	BTFZ616	\N	\N	cold	6x16
6112	Boulon Tête Fraisée Zingué à chaud 6x16	BTFZC616	\N	\N	hot	6x16
6113	Boulon Tête Fraisée Acier 6x16	BTFA616	\N	\N	acier	6x16
6114	Boulon Tête Fraisée Brut 6x20	BTFB620	\N	\N	none	6x20
6115	Boulon Tête Fraisée Zingué 6x20	BTFZ620	\N	\N	cold	6x20
6116	Boulon Tête Fraisée Zingué à chaud 6x20	BTFZC620	\N	\N	hot	6x20
6117	Boulon Tête Fraisée Acier 6x20	BTFA620	\N	\N	acier	6x20
6118	Boulon Tête Fraisée Brut 6x25	BTFB625	\N	\N	none	6x25
6119	Boulon Tête Fraisée Zingué 6x25	BTFZ625	\N	\N	cold	6x25
6120	Boulon Tête Fraisée Zingué à chaud 6x25	BTFZC625	\N	\N	hot	6x25
6121	Boulon Tête Fraisée Acier 6x25	BTFA625	\N	\N	acier	6x25
6122	Boulon Tête Fraisée Brut 6x30	BTFB630	\N	\N	none	6x30
6123	Boulon Tête Fraisée Zingué 6x30	BTFZ630	\N	\N	cold	6x30
6124	Boulon Tête Fraisée Zingué à chaud 6x30	BTFZC630	\N	\N	hot	6x30
6125	Boulon Tête Fraisée Acier 6x30	BTFA630	\N	\N	acier	6x30
6126	Boulon Tête Fraisée Brut 6x35	BTFB635	\N	\N	none	6x35
6127	Boulon Tête Fraisée Zingué 6x35	BTFZ635	\N	\N	cold	6x35
6128	Boulon Tête Fraisée Zingué à chaud 6x35	BTFZC635	\N	\N	hot	6x35
6129	Boulon Tête Fraisée Acier 6x35	BTFA635	\N	\N	acier	6x35
6130	Boulon Tête Fraisée Brut 6x40	BTFB640	\N	\N	none	6x40
6131	Boulon Tête Fraisée Zingué 6x40	BTFZ640	\N	\N	cold	6x40
6132	Boulon Tête Fraisée Zingué à chaud 6x40	BTFZC640	\N	\N	hot	6x40
6133	Boulon Tête Fraisée Acier 6x40	BTFA640	\N	\N	acier	6x40
6134	Boulon Tête Fraisée Brut 6x45	BTFB645	\N	\N	none	6x45
6135	Boulon Tête Fraisée Zingué 6x45	BTFZ645	\N	\N	cold	6x45
6136	Boulon Tête Fraisée Zingué à chaud 6x45	BTFZC645	\N	\N	hot	6x45
6137	Boulon Tête Fraisée Acier 6x45	BTFA645	\N	\N	acier	6x45
6138	Boulon Tête Fraisée Brut 6x50	BTFB650	\N	\N	none	6x50
6139	Boulon Tête Fraisée Zingué 6x50	BTFZ650	\N	\N	cold	6x50
6140	Boulon Tête Fraisée Zingué à chaud 6x50	BTFZC650	\N	\N	hot	6x50
6141	Boulon Tête Fraisée Acier 6x50	BTFA650	\N	\N	acier	6x50
6142	Boulon Tête Fraisée Brut 6x55	BTFB655	\N	\N	none	6x55
6143	Boulon Tête Fraisée Zingué 6x55	BTFZ655	\N	\N	cold	6x55
6144	Boulon Tête Fraisée Zingué à chaud 6x55	BTFZC655	\N	\N	hot	6x55
6145	Boulon Tête Fraisée Acier 6x55	BTFA655	\N	\N	acier	6x55
6146	Boulon Tête Fraisée Brut 6x60	BTFB660	\N	\N	none	6x60
6147	Boulon Tête Fraisée Zingué 6x60	BTFZ660	\N	\N	cold	6x60
6148	Boulon Tête Fraisée Zingué à chaud 6x60	BTFZC660	\N	\N	hot	6x60
6149	Boulon Tête Fraisée Acier 6x60	BTFA660	\N	\N	acier	6x60
6150	Boulon Tête Fraisée Brut 6x65	BTFB665	\N	\N	none	6x65
6151	Boulon Tête Fraisée Zingué 6x65	BTFZ665	\N	\N	cold	6x65
6152	Boulon Tête Fraisée Zingué à chaud 6x65	BTFZC665	\N	\N	hot	6x65
6153	Boulon Tête Fraisée Acier 6x65	BTFA665	\N	\N	acier	6x65
6154	Boulon Tête Fraisée Brut 6x70	BTFB670	\N	\N	none	6x70
6155	Boulon Tête Fraisée Zingué 6x70	BTFZ670	\N	\N	cold	6x70
6156	Boulon Tête Fraisée Zingué à chaud 6x70	BTFZC670	\N	\N	hot	6x70
6157	Boulon Tête Fraisée Acier 6x70	BTFA670	\N	\N	acier	6x70
6158	Boulon Tête Fraisée Brut 6x75	BTFB675	\N	\N	none	6x75
6159	Boulon Tête Fraisée Zingué 6x75	BTFZ675	\N	\N	cold	6x75
6160	Boulon Tête Fraisée Zingué à chaud 6x75	BTFZC675	\N	\N	hot	6x75
6161	Boulon Tête Fraisée Acier 6x75	BTFA675	\N	\N	acier	6x75
6162	Boulon Tête Fraisée Brut 6x80	BTFB680	\N	\N	none	6x80
6163	Boulon Tête Fraisée Zingué 6x80	BTFZ680	\N	\N	cold	6x80
6164	Boulon Tête Fraisée Zingué à chaud 6x80	BTFZC680	\N	\N	hot	6x80
6165	Boulon Tête Fraisée Acier 6x80	BTFA680	\N	\N	acier	6x80
6166	Boulon Tête Fraisée Brut 6x85	BTFB685	\N	\N	none	6x85
6167	Boulon Tête Fraisée Zingué 6x85	BTFZ685	\N	\N	cold	6x85
6168	Boulon Tête Fraisée Zingué à chaud 6x85	BTFZC685	\N	\N	hot	6x85
6169	Boulon Tête Fraisée Acier 6x85	BTFA685	\N	\N	acier	6x85
6170	Boulon Tête Fraisée Brut 6x90	BTFB690	\N	\N	none	6x90
6171	Boulon Tête Fraisée Zingué 6x90	BTFZ690	\N	\N	cold	6x90
6172	Boulon Tête Fraisée Zingué à chaud 6x90	BTFZC690	\N	\N	hot	6x90
6173	Boulon Tête Fraisée Acier 6x90	BTFA690	\N	\N	acier	6x90
6174	Boulon Tête Fraisée Brut 6x100	BTFB6100	\N	\N	none	6x100
6175	Boulon Tête Fraisée Zingué 6x100	BTFZ6100	\N	\N	cold	6x100
6176	Boulon Tête Fraisée Zingué à chaud 6x100	BTFZC6100	\N	\N	hot	6x100
6177	Boulon Tête Fraisée Acier 6x100	BTFA6100	\N	\N	acier	6x100
6178	Boulon Tête Fraisée Brut 6x110	BTFB6110	\N	\N	none	6x110
6179	Boulon Tête Fraisée Zingué 6x110	BTFZ6110	\N	\N	cold	6x110
6180	Boulon Tête Fraisée Zingué à chaud 6x110	BTFZC6110	\N	\N	hot	6x110
6181	Boulon Tête Fraisée Acier 6x110	BTFA6110	\N	\N	acier	6x110
6182	Boulon Tête Fraisée Brut 6x120	BTFB6120	\N	\N	none	6x120
6183	Boulon Tête Fraisée Zingué 6x120	BTFZ6120	\N	\N	cold	6x120
6184	Boulon Tête Fraisée Zingué à chaud 6x120	BTFZC6120	\N	\N	hot	6x120
6185	Boulon Tête Fraisée Acier 6x120	BTFA6120	\N	\N	acier	6x120
6186	Boulon Tête Fraisée Brut 6x130	BTFB6130	\N	\N	none	6x130
6187	Boulon Tête Fraisée Zingué 6x130	BTFZ6130	\N	\N	cold	6x130
6188	Boulon Tête Fraisée Zingué à chaud 6x130	BTFZC6130	\N	\N	hot	6x130
6189	Boulon Tête Fraisée Acier 6x130	BTFA6130	\N	\N	acier	6x130
6190	Boulon Tête Fraisée Brut 6x140	BTFB6140	\N	\N	none	6x140
6191	Boulon Tête Fraisée Zingué 6x140	BTFZ6140	\N	\N	cold	6x140
6192	Boulon Tête Fraisée Zingué à chaud 6x140	BTFZC6140	\N	\N	hot	6x140
6193	Boulon Tête Fraisée Acier 6x140	BTFA6140	\N	\N	acier	6x140
6194	Boulon Tête Fraisée Brut 6x150	BTFB6150	\N	\N	none	6x150
6195	Boulon Tête Fraisée Zingué 6x150	BTFZ6150	\N	\N	cold	6x150
6196	Boulon Tête Fraisée Zingué à chaud 6x150	BTFZC6150	\N	\N	hot	6x150
6197	Boulon Tête Fraisée Acier 6x150	BTFA6150	\N	\N	acier	6x150
6198	Boulon Tête Fraisée Brut 8x12	BTFB812	\N	\N	none	8x12
6199	Boulon Tête Fraisée Zingué 8x12	BTFZ812	\N	\N	cold	8x12
6200	Boulon Tête Fraisée Zingué à chaud 8x12	BTFZC812	\N	\N	hot	8x12
6201	Boulon Tête Fraisée Acier 8x12	BTFA812	\N	\N	acier	8x12
6202	Boulon Tête Fraisée Brut 8x16	BTFB816	\N	\N	none	8x16
6203	Boulon Tête Fraisée Zingué 8x16	BTFZ816	\N	\N	cold	8x16
6204	Boulon Tête Fraisée Zingué à chaud 8x16	BTFZC816	\N	\N	hot	8x16
6205	Boulon Tête Fraisée Acier 8x16	BTFA816	\N	\N	acier	8x16
6206	Boulon Tête Fraisée Brut 8x20	BTFB820	\N	\N	none	8x20
6207	Boulon Tête Fraisée Zingué 8x20	BTFZ820	\N	\N	cold	8x20
6208	Boulon Tête Fraisée Zingué à chaud 8x20	BTFZC820	\N	\N	hot	8x20
6209	Boulon Tête Fraisée Acier 8x20	BTFA820	\N	\N	acier	8x20
6210	Boulon Tête Fraisée Brut 8x25	BTFB825	\N	\N	none	8x25
6211	Boulon Tête Fraisée Zingué 8x25	BTFZ825	\N	\N	cold	8x25
6212	Boulon Tête Fraisée Zingué à chaud 8x25	BTFZC825	\N	\N	hot	8x25
6213	Boulon Tête Fraisée Acier 8x25	BTFA825	\N	\N	acier	8x25
6214	Boulon Tête Fraisée Brut 8x30	BTFB830	\N	\N	none	8x30
6215	Boulon Tête Fraisée Zingué 8x30	BTFZ830	\N	\N	cold	8x30
6216	Boulon Tête Fraisée Zingué à chaud 8x30	BTFZC830	\N	\N	hot	8x30
6217	Boulon Tête Fraisée Acier 8x30	BTFA830	\N	\N	acier	8x30
6218	Boulon Tête Fraisée Brut 8x35	BTFB835	\N	\N	none	8x35
6219	Boulon Tête Fraisée Zingué 8x35	BTFZ835	\N	\N	cold	8x35
6220	Boulon Tête Fraisée Zingué à chaud 8x35	BTFZC835	\N	\N	hot	8x35
6221	Boulon Tête Fraisée Acier 8x35	BTFA835	\N	\N	acier	8x35
6222	Boulon Tête Fraisée Brut 8x40	BTFB840	\N	\N	none	8x40
6223	Boulon Tête Fraisée Zingué 8x40	BTFZ840	\N	\N	cold	8x40
6224	Boulon Tête Fraisée Zingué à chaud 8x40	BTFZC840	\N	\N	hot	8x40
6225	Boulon Tête Fraisée Acier 8x40	BTFA840	\N	\N	acier	8x40
6226	Boulon Tête Fraisée Brut 8x45	BTFB845	\N	\N	none	8x45
6227	Boulon Tête Fraisée Zingué 8x45	BTFZ845	\N	\N	cold	8x45
6228	Boulon Tête Fraisée Zingué à chaud 8x45	BTFZC845	\N	\N	hot	8x45
6229	Boulon Tête Fraisée Acier 8x45	BTFA845	\N	\N	acier	8x45
6230	Boulon Tête Fraisée Brut 8x50	BTFB850	\N	\N	none	8x50
6231	Boulon Tête Fraisée Zingué 8x50	BTFZ850	\N	\N	cold	8x50
6232	Boulon Tête Fraisée Zingué à chaud 8x50	BTFZC850	\N	\N	hot	8x50
6233	Boulon Tête Fraisée Acier 8x50	BTFA850	\N	\N	acier	8x50
6234	Boulon Tête Fraisée Brut 8x55	BTFB855	\N	\N	none	8x55
6235	Boulon Tête Fraisée Zingué 8x55	BTFZ855	\N	\N	cold	8x55
6236	Boulon Tête Fraisée Zingué à chaud 8x55	BTFZC855	\N	\N	hot	8x55
6237	Boulon Tête Fraisée Acier 8x55	BTFA855	\N	\N	acier	8x55
6238	Boulon Tête Fraisée Brut 8x60	BTFB860	\N	\N	none	8x60
6239	Boulon Tête Fraisée Zingué 8x60	BTFZ860	\N	\N	cold	8x60
6240	Boulon Tête Fraisée Zingué à chaud 8x60	BTFZC860	\N	\N	hot	8x60
6241	Boulon Tête Fraisée Acier 8x60	BTFA860	\N	\N	acier	8x60
6242	Boulon Tête Fraisée Brut 8x65	BTFB865	\N	\N	none	8x65
6243	Boulon Tête Fraisée Zingué 8x65	BTFZ865	\N	\N	cold	8x65
6244	Boulon Tête Fraisée Zingué à chaud 8x65	BTFZC865	\N	\N	hot	8x65
6245	Boulon Tête Fraisée Acier 8x65	BTFA865	\N	\N	acier	8x65
6246	Boulon Tête Fraisée Brut 8x70	BTFB870	\N	\N	none	8x70
6247	Boulon Tête Fraisée Zingué 8x70	BTFZ870	\N	\N	cold	8x70
6248	Boulon Tête Fraisée Zingué à chaud 8x70	BTFZC870	\N	\N	hot	8x70
6249	Boulon Tête Fraisée Acier 8x70	BTFA870	\N	\N	acier	8x70
6250	Boulon Tête Fraisée Brut 8x75	BTFB875	\N	\N	none	8x75
6251	Boulon Tête Fraisée Zingué 8x75	BTFZ875	\N	\N	cold	8x75
6252	Boulon Tête Fraisée Zingué à chaud 8x75	BTFZC875	\N	\N	hot	8x75
6253	Boulon Tête Fraisée Acier 8x75	BTFA875	\N	\N	acier	8x75
6254	Boulon Tête Fraisée Brut 8x80	BTFB880	\N	\N	none	8x80
6255	Boulon Tête Fraisée Zingué 8x80	BTFZ880	\N	\N	cold	8x80
6256	Boulon Tête Fraisée Zingué à chaud 8x80	BTFZC880	\N	\N	hot	8x80
6257	Boulon Tête Fraisée Acier 8x80	BTFA880	\N	\N	acier	8x80
6258	Boulon Tête Fraisée Brut 8x85	BTFB885	\N	\N	none	8x85
6259	Boulon Tête Fraisée Zingué 8x85	BTFZ885	\N	\N	cold	8x85
6260	Boulon Tête Fraisée Zingué à chaud 8x85	BTFZC885	\N	\N	hot	8x85
6261	Boulon Tête Fraisée Acier 8x85	BTFA885	\N	\N	acier	8x85
6262	Boulon Tête Fraisée Brut 8x90	BTFB890	\N	\N	none	8x90
6263	Boulon Tête Fraisée Zingué 8x90	BTFZ890	\N	\N	cold	8x90
6264	Boulon Tête Fraisée Zingué à chaud 8x90	BTFZC890	\N	\N	hot	8x90
6265	Boulon Tête Fraisée Acier 8x90	BTFA890	\N	\N	acier	8x90
6266	Boulon Tête Fraisée Brut 8x100	BTFB8100	\N	\N	none	8x100
6267	Boulon Tête Fraisée Zingué 8x100	BTFZ8100	\N	\N	cold	8x100
6268	Boulon Tête Fraisée Zingué à chaud 8x100	BTFZC8100	\N	\N	hot	8x100
6269	Boulon Tête Fraisée Acier 8x100	BTFA8100	\N	\N	acier	8x100
6270	Boulon Tête Fraisée Brut 8x110	BTFB8110	\N	\N	none	8x110
6271	Boulon Tête Fraisée Zingué 8x110	BTFZ8110	\N	\N	cold	8x110
6272	Boulon Tête Fraisée Zingué à chaud 8x110	BTFZC8110	\N	\N	hot	8x110
6273	Boulon Tête Fraisée Acier 8x110	BTFA8110	\N	\N	acier	8x110
6274	Boulon Tête Fraisée Brut 8x120	BTFB8120	\N	\N	none	8x120
6275	Boulon Tête Fraisée Zingué 8x120	BTFZ8120	\N	\N	cold	8x120
6276	Boulon Tête Fraisée Zingué à chaud 8x120	BTFZC8120	\N	\N	hot	8x120
6277	Boulon Tête Fraisée Acier 8x120	BTFA8120	\N	\N	acier	8x120
6278	Boulon Tête Fraisée Brut 8x130	BTFB8130	\N	\N	none	8x130
6279	Boulon Tête Fraisée Zingué 8x130	BTFZ8130	\N	\N	cold	8x130
6280	Boulon Tête Fraisée Zingué à chaud 8x130	BTFZC8130	\N	\N	hot	8x130
6281	Boulon Tête Fraisée Acier 8x130	BTFA8130	\N	\N	acier	8x130
6282	Boulon Tête Fraisée Brut 8x140	BTFB8140	\N	\N	none	8x140
6283	Boulon Tête Fraisée Zingué 8x140	BTFZ8140	\N	\N	cold	8x140
6284	Boulon Tête Fraisée Zingué à chaud 8x140	BTFZC8140	\N	\N	hot	8x140
6285	Boulon Tête Fraisée Acier 8x140	BTFA8140	\N	\N	acier	8x140
6286	Boulon Tête Fraisée Brut 8x150	BTFB8150	\N	\N	none	8x150
6287	Boulon Tête Fraisée Zingué 8x150	BTFZ8150	\N	\N	cold	8x150
6288	Boulon Tête Fraisée Zingué à chaud 8x150	BTFZC8150	\N	\N	hot	8x150
6289	Boulon Tête Fraisée Acier 8x150	BTFA8150	\N	\N	acier	8x150
6290	Boulon Demi Filetage Brut 12x12	BDFB1212	\N	\N	none	12x12
6291	Boulon Demi Filetage Zingué 12x12	BDFZ1212	\N	\N	cold	12x12
6292	Boulon Demi Filetage Zingué à chaud 12x12	BDFZC1212	\N	\N	hot	12x12
6293	Boulon Demi Filetage Acier 12x12	BDFA1212	\N	\N	acier	12x12
6294	Boulon Demi Filetage Brut 12x16	BDFB1216	\N	\N	none	12x16
6295	Boulon Demi Filetage Zingué 12x16	BDFZ1216	\N	\N	cold	12x16
6296	Boulon Demi Filetage Zingué à chaud 12x16	BDFZC1216	\N	\N	hot	12x16
6297	Boulon Demi Filetage Acier 12x16	BDFA1216	\N	\N	acier	12x16
6298	Boulon Demi Filetage Brut 12x20	BDFB1220	\N	\N	none	12x20
6299	Boulon Demi Filetage Zingué 12x20	BDFZ1220	\N	\N	cold	12x20
6300	Boulon Demi Filetage Zingué à chaud 12x20	BDFZC1220	\N	\N	hot	12x20
6301	Boulon Demi Filetage Acier 12x20	BDFA1220	\N	\N	acier	12x20
6302	Boulon Demi Filetage Brut 12x25	BDFB1225	\N	\N	none	12x25
6303	Boulon Demi Filetage Zingué 12x25	BDFZ1225	\N	\N	cold	12x25
6304	Boulon Demi Filetage Zingué à chaud 12x25	BDFZC1225	\N	\N	hot	12x25
6305	Boulon Demi Filetage Acier 12x25	BDFA1225	\N	\N	acier	12x25
6306	Boulon Demi Filetage Brut 12x30	BDFB1230	\N	\N	none	12x30
6307	Boulon Demi Filetage Zingué 12x30	BDFZ1230	\N	\N	cold	12x30
6308	Boulon Demi Filetage Zingué à chaud 12x30	BDFZC1230	\N	\N	hot	12x30
6309	Boulon Demi Filetage Acier 12x30	BDFA1230	\N	\N	acier	12x30
6310	Boulon Demi Filetage Brut 12x35	BDFB1235	\N	\N	none	12x35
6311	Boulon Demi Filetage Zingué 12x35	BDFZ1235	\N	\N	cold	12x35
6312	Boulon Demi Filetage Zingué à chaud 12x35	BDFZC1235	\N	\N	hot	12x35
6313	Boulon Demi Filetage Acier 12x35	BDFA1235	\N	\N	acier	12x35
6314	Boulon Demi Filetage Brut 12x40	BDFB1240	\N	\N	none	12x40
6315	Boulon Demi Filetage Zingué 12x40	BDFZ1240	\N	\N	cold	12x40
6316	Boulon Demi Filetage Zingué à chaud 12x40	BDFZC1240	\N	\N	hot	12x40
6317	Boulon Demi Filetage Acier 12x40	BDFA1240	\N	\N	acier	12x40
6318	Boulon Demi Filetage Brut 12x45	BDFB1245	\N	\N	none	12x45
6319	Boulon Demi Filetage Zingué 12x45	BDFZ1245	\N	\N	cold	12x45
6320	Boulon Demi Filetage Zingué à chaud 12x45	BDFZC1245	\N	\N	hot	12x45
6321	Boulon Demi Filetage Acier 12x45	BDFA1245	\N	\N	acier	12x45
6322	Boulon Demi Filetage Brut 12x50	BDFB1250	\N	\N	none	12x50
6323	Boulon Demi Filetage Zingué 12x50	BDFZ1250	\N	\N	cold	12x50
6324	Boulon Demi Filetage Zingué à chaud 12x50	BDFZC1250	\N	\N	hot	12x50
6325	Boulon Demi Filetage Acier 12x50	BDFA1250	\N	\N	acier	12x50
6326	Boulon Demi Filetage Brut 12x55	BDFB1255	\N	\N	none	12x55
6327	Boulon Demi Filetage Zingué 12x55	BDFZ1255	\N	\N	cold	12x55
6328	Boulon Demi Filetage Zingué à chaud 12x55	BDFZC1255	\N	\N	hot	12x55
6329	Boulon Demi Filetage Acier 12x55	BDFA1255	\N	\N	acier	12x55
6330	Boulon Demi Filetage Brut 12x60	BDFB1260	\N	\N	none	12x60
6331	Boulon Demi Filetage Zingué 12x60	BDFZ1260	\N	\N	cold	12x60
6332	Boulon Demi Filetage Zingué à chaud 12x60	BDFZC1260	\N	\N	hot	12x60
6333	Boulon Demi Filetage Acier 12x60	BDFA1260	\N	\N	acier	12x60
6334	Boulon Demi Filetage Brut 12x65	BDFB1265	\N	\N	none	12x65
6335	Boulon Demi Filetage Zingué 12x65	BDFZ1265	\N	\N	cold	12x65
6336	Boulon Demi Filetage Zingué à chaud 12x65	BDFZC1265	\N	\N	hot	12x65
6337	Boulon Demi Filetage Acier 12x65	BDFA1265	\N	\N	acier	12x65
6338	Boulon Demi Filetage Brut 12x70	BDFB1270	\N	\N	none	12x70
6339	Boulon Demi Filetage Zingué 12x70	BDFZ1270	\N	\N	cold	12x70
6340	Boulon Demi Filetage Zingué à chaud 12x70	BDFZC1270	\N	\N	hot	12x70
6341	Boulon Demi Filetage Acier 12x70	BDFA1270	\N	\N	acier	12x70
6342	Boulon Demi Filetage Brut 12x75	BDFB1275	\N	\N	none	12x75
6343	Boulon Demi Filetage Zingué 12x75	BDFZ1275	\N	\N	cold	12x75
6344	Boulon Demi Filetage Zingué à chaud 12x75	BDFZC1275	\N	\N	hot	12x75
6345	Boulon Demi Filetage Acier 12x75	BDFA1275	\N	\N	acier	12x75
6346	Boulon Demi Filetage Brut 12x80	BDFB1280	\N	\N	none	12x80
6347	Boulon Demi Filetage Zingué 12x80	BDFZ1280	\N	\N	cold	12x80
6348	Boulon Demi Filetage Zingué à chaud 12x80	BDFZC1280	\N	\N	hot	12x80
6349	Boulon Demi Filetage Acier 12x80	BDFA1280	\N	\N	acier	12x80
6350	Boulon Demi Filetage Brut 12x85	BDFB1285	\N	\N	none	12x85
6351	Boulon Demi Filetage Zingué 12x85	BDFZ1285	\N	\N	cold	12x85
6352	Boulon Demi Filetage Zingué à chaud 12x85	BDFZC1285	\N	\N	hot	12x85
6353	Boulon Demi Filetage Acier 12x85	BDFA1285	\N	\N	acier	12x85
6354	Boulon Demi Filetage Brut 12x90	BDFB1290	\N	\N	none	12x90
6355	Boulon Demi Filetage Zingué 12x90	BDFZ1290	\N	\N	cold	12x90
6356	Boulon Demi Filetage Zingué à chaud 12x90	BDFZC1290	\N	\N	hot	12x90
6357	Boulon Demi Filetage Acier 12x90	BDFA1290	\N	\N	acier	12x90
6358	Boulon Demi Filetage Brut 12x100	BDFB12100	\N	\N	none	12x100
6359	Boulon Demi Filetage Zingué 12x100	BDFZ12100	\N	\N	cold	12x100
6360	Boulon Demi Filetage Zingué à chaud 12x100	BDFZC12100	\N	\N	hot	12x100
6361	Boulon Demi Filetage Acier 12x100	BDFA12100	\N	\N	acier	12x100
6362	Boulon Demi Filetage Brut 12x110	BDFB12110	\N	\N	none	12x110
6363	Boulon Demi Filetage Zingué 12x110	BDFZ12110	\N	\N	cold	12x110
6364	Boulon Demi Filetage Zingué à chaud 12x110	BDFZC12110	\N	\N	hot	12x110
6365	Boulon Demi Filetage Acier 12x110	BDFA12110	\N	\N	acier	12x110
6366	Boulon Demi Filetage Brut 12x120	BDFB12120	\N	\N	none	12x120
6367	Boulon Demi Filetage Zingué 12x120	BDFZ12120	\N	\N	cold	12x120
6368	Boulon Demi Filetage Zingué à chaud 12x120	BDFZC12120	\N	\N	hot	12x120
6369	Boulon Demi Filetage Acier 12x120	BDFA12120	\N	\N	acier	12x120
6370	Boulon Demi Filetage Brut 12x130	BDFB12130	\N	\N	none	12x130
6371	Boulon Demi Filetage Zingué 12x130	BDFZ12130	\N	\N	cold	12x130
6372	Boulon Demi Filetage Zingué à chaud 12x130	BDFZC12130	\N	\N	hot	12x130
6373	Boulon Demi Filetage Acier 12x130	BDFA12130	\N	\N	acier	12x130
6374	Boulon Demi Filetage Brut 12x140	BDFB12140	\N	\N	none	12x140
6375	Boulon Demi Filetage Zingué 12x140	BDFZ12140	\N	\N	cold	12x140
6376	Boulon Demi Filetage Zingué à chaud 12x140	BDFZC12140	\N	\N	hot	12x140
6377	Boulon Demi Filetage Acier 12x140	BDFA12140	\N	\N	acier	12x140
6378	Boulon Demi Filetage Brut 12x150	BDFB12150	\N	\N	none	12x150
6379	Boulon Demi Filetage Zingué 12x150	BDFZ12150	\N	\N	cold	12x150
6380	Boulon Demi Filetage Zingué à chaud 12x150	BDFZC12150	\N	\N	hot	12x150
6381	Boulon Demi Filetage Acier 12x150	BDFA12150	\N	\N	acier	12x150
6382	Boulon Demi Filetage Brut 12x160	BDFB12160	\N	\N	none	12x160
6383	Boulon Demi Filetage Zingué 12x160	BDFZ12160	\N	\N	cold	12x160
6384	Boulon Demi Filetage Zingué à chaud 12x160	BDFZC12160	\N	\N	hot	12x160
6385	Boulon Demi Filetage Acier 12x160	BDFA12160	\N	\N	acier	12x160
6386	Boulon Demi Filetage Brut 12x170	BDFB12170	\N	\N	none	12x170
6387	Boulon Demi Filetage Zingué 12x170	BDFZ12170	\N	\N	cold	12x170
6388	Boulon Demi Filetage Zingué à chaud 12x170	BDFZC12170	\N	\N	hot	12x170
6389	Boulon Demi Filetage Acier 12x170	BDFA12170	\N	\N	acier	12x170
6390	Boulon Demi Filetage Brut 12x180	BDFB12180	\N	\N	none	12x180
6391	Boulon Demi Filetage Zingué 12x180	BDFZ12180	\N	\N	cold	12x180
6392	Boulon Demi Filetage Zingué à chaud 12x180	BDFZC12180	\N	\N	hot	12x180
6393	Boulon Demi Filetage Acier 12x180	BDFA12180	\N	\N	acier	12x180
6394	Boulon Demi Filetage Brut 12x190	BDFB12190	\N	\N	none	12x190
6395	Boulon Demi Filetage Zingué 12x190	BDFZ12190	\N	\N	cold	12x190
6396	Boulon Demi Filetage Zingué à chaud 12x190	BDFZC12190	\N	\N	hot	12x190
6397	Boulon Demi Filetage Acier 12x190	BDFA12190	\N	\N	acier	12x190
6398	Boulon Demi Filetage Brut 12x200	BDFB12200	\N	\N	none	12x200
6399	Boulon Demi Filetage Zingué 12x200	BDFZ12200	\N	\N	cold	12x200
6400	Boulon Demi Filetage Zingué à chaud 12x200	BDFZC12200	\N	\N	hot	12x200
6401	Boulon Demi Filetage Acier 12x200	BDFA12200	\N	\N	acier	12x200
6402	Boulon Demi Filetage Brut 14x12	BDFB1412	\N	\N	none	14x12
6403	Boulon Demi Filetage Zingué 14x12	BDFZ1412	\N	\N	cold	14x12
6404	Boulon Demi Filetage Zingué à chaud 14x12	BDFZC1412	\N	\N	hot	14x12
6405	Boulon Demi Filetage Acier 14x12	BDFA1412	\N	\N	acier	14x12
6406	Boulon Demi Filetage Brut 14x16	BDFB1416	\N	\N	none	14x16
6407	Boulon Demi Filetage Zingué 14x16	BDFZ1416	\N	\N	cold	14x16
6408	Boulon Demi Filetage Zingué à chaud 14x16	BDFZC1416	\N	\N	hot	14x16
6409	Boulon Demi Filetage Acier 14x16	BDFA1416	\N	\N	acier	14x16
6410	Boulon Demi Filetage Brut 14x20	BDFB1420	\N	\N	none	14x20
6411	Boulon Demi Filetage Zingué 14x20	BDFZ1420	\N	\N	cold	14x20
6412	Boulon Demi Filetage Zingué à chaud 14x20	BDFZC1420	\N	\N	hot	14x20
6413	Boulon Demi Filetage Acier 14x20	BDFA1420	\N	\N	acier	14x20
6414	Boulon Demi Filetage Brut 14x25	BDFB1425	\N	\N	none	14x25
6415	Boulon Demi Filetage Zingué 14x25	BDFZ1425	\N	\N	cold	14x25
6416	Boulon Demi Filetage Zingué à chaud 14x25	BDFZC1425	\N	\N	hot	14x25
6417	Boulon Demi Filetage Acier 14x25	BDFA1425	\N	\N	acier	14x25
6418	Boulon Demi Filetage Brut 14x30	BDFB1430	\N	\N	none	14x30
6419	Boulon Demi Filetage Zingué 14x30	BDFZ1430	\N	\N	cold	14x30
6420	Boulon Demi Filetage Zingué à chaud 14x30	BDFZC1430	\N	\N	hot	14x30
6421	Boulon Demi Filetage Acier 14x30	BDFA1430	\N	\N	acier	14x30
6422	Boulon Demi Filetage Brut 14x35	BDFB1435	\N	\N	none	14x35
6423	Boulon Demi Filetage Zingué 14x35	BDFZ1435	\N	\N	cold	14x35
6424	Boulon Demi Filetage Zingué à chaud 14x35	BDFZC1435	\N	\N	hot	14x35
6425	Boulon Demi Filetage Acier 14x35	BDFA1435	\N	\N	acier	14x35
6426	Boulon Demi Filetage Brut 14x40	BDFB1440	\N	\N	none	14x40
6427	Boulon Demi Filetage Zingué 14x40	BDFZ1440	\N	\N	cold	14x40
6428	Boulon Demi Filetage Zingué à chaud 14x40	BDFZC1440	\N	\N	hot	14x40
6429	Boulon Demi Filetage Acier 14x40	BDFA1440	\N	\N	acier	14x40
6430	Boulon Demi Filetage Brut 14x45	BDFB1445	\N	\N	none	14x45
6431	Boulon Demi Filetage Zingué 14x45	BDFZ1445	\N	\N	cold	14x45
6432	Boulon Demi Filetage Zingué à chaud 14x45	BDFZC1445	\N	\N	hot	14x45
6433	Boulon Demi Filetage Acier 14x45	BDFA1445	\N	\N	acier	14x45
6434	Boulon Demi Filetage Brut 14x50	BDFB1450	\N	\N	none	14x50
6435	Boulon Demi Filetage Zingué 14x50	BDFZ1450	\N	\N	cold	14x50
6436	Boulon Demi Filetage Zingué à chaud 14x50	BDFZC1450	\N	\N	hot	14x50
6437	Boulon Demi Filetage Acier 14x50	BDFA1450	\N	\N	acier	14x50
6438	Boulon Demi Filetage Brut 14x55	BDFB1455	\N	\N	none	14x55
6439	Boulon Demi Filetage Zingué 14x55	BDFZ1455	\N	\N	cold	14x55
6440	Boulon Demi Filetage Zingué à chaud 14x55	BDFZC1455	\N	\N	hot	14x55
6441	Boulon Demi Filetage Acier 14x55	BDFA1455	\N	\N	acier	14x55
6442	Boulon Demi Filetage Brut 14x60	BDFB1460	\N	\N	none	14x60
6443	Boulon Demi Filetage Zingué 14x60	BDFZ1460	\N	\N	cold	14x60
6444	Boulon Demi Filetage Zingué à chaud 14x60	BDFZC1460	\N	\N	hot	14x60
6445	Boulon Demi Filetage Acier 14x60	BDFA1460	\N	\N	acier	14x60
6446	Boulon Demi Filetage Brut 14x65	BDFB1465	\N	\N	none	14x65
6447	Boulon Demi Filetage Zingué 14x65	BDFZ1465	\N	\N	cold	14x65
6448	Boulon Demi Filetage Zingué à chaud 14x65	BDFZC1465	\N	\N	hot	14x65
6449	Boulon Demi Filetage Acier 14x65	BDFA1465	\N	\N	acier	14x65
6450	Boulon Demi Filetage Brut 14x70	BDFB1470	\N	\N	none	14x70
6451	Boulon Demi Filetage Zingué 14x70	BDFZ1470	\N	\N	cold	14x70
6452	Boulon Demi Filetage Zingué à chaud 14x70	BDFZC1470	\N	\N	hot	14x70
6453	Boulon Demi Filetage Acier 14x70	BDFA1470	\N	\N	acier	14x70
6454	Boulon Demi Filetage Brut 14x75	BDFB1475	\N	\N	none	14x75
6455	Boulon Demi Filetage Zingué 14x75	BDFZ1475	\N	\N	cold	14x75
6456	Boulon Demi Filetage Zingué à chaud 14x75	BDFZC1475	\N	\N	hot	14x75
6457	Boulon Demi Filetage Acier 14x75	BDFA1475	\N	\N	acier	14x75
6458	Boulon Demi Filetage Brut 14x80	BDFB1480	\N	\N	none	14x80
6459	Boulon Demi Filetage Zingué 14x80	BDFZ1480	\N	\N	cold	14x80
6460	Boulon Demi Filetage Zingué à chaud 14x80	BDFZC1480	\N	\N	hot	14x80
6461	Boulon Demi Filetage Acier 14x80	BDFA1480	\N	\N	acier	14x80
6462	Boulon Demi Filetage Brut 14x85	BDFB1485	\N	\N	none	14x85
6463	Boulon Demi Filetage Zingué 14x85	BDFZ1485	\N	\N	cold	14x85
6464	Boulon Demi Filetage Zingué à chaud 14x85	BDFZC1485	\N	\N	hot	14x85
6465	Boulon Demi Filetage Acier 14x85	BDFA1485	\N	\N	acier	14x85
6466	Boulon Demi Filetage Brut 14x90	BDFB1490	\N	\N	none	14x90
6467	Boulon Demi Filetage Zingué 14x90	BDFZ1490	\N	\N	cold	14x90
6468	Boulon Demi Filetage Zingué à chaud 14x90	BDFZC1490	\N	\N	hot	14x90
6469	Boulon Demi Filetage Acier 14x90	BDFA1490	\N	\N	acier	14x90
6470	Boulon Demi Filetage Brut 14x100	BDFB14100	\N	\N	none	14x100
6471	Boulon Demi Filetage Zingué 14x100	BDFZ14100	\N	\N	cold	14x100
6472	Boulon Demi Filetage Zingué à chaud 14x100	BDFZC14100	\N	\N	hot	14x100
6473	Boulon Demi Filetage Acier 14x100	BDFA14100	\N	\N	acier	14x100
6474	Boulon Demi Filetage Brut 14x110	BDFB14110	\N	\N	none	14x110
6475	Boulon Demi Filetage Zingué 14x110	BDFZ14110	\N	\N	cold	14x110
6476	Boulon Demi Filetage Zingué à chaud 14x110	BDFZC14110	\N	\N	hot	14x110
6477	Boulon Demi Filetage Acier 14x110	BDFA14110	\N	\N	acier	14x110
6478	Boulon Demi Filetage Brut 14x120	BDFB14120	\N	\N	none	14x120
6479	Boulon Demi Filetage Zingué 14x120	BDFZ14120	\N	\N	cold	14x120
6480	Boulon Demi Filetage Zingué à chaud 14x120	BDFZC14120	\N	\N	hot	14x120
6481	Boulon Demi Filetage Acier 14x120	BDFA14120	\N	\N	acier	14x120
6482	Boulon Demi Filetage Brut 14x130	BDFB14130	\N	\N	none	14x130
6483	Boulon Demi Filetage Zingué 14x130	BDFZ14130	\N	\N	cold	14x130
6484	Boulon Demi Filetage Zingué à chaud 14x130	BDFZC14130	\N	\N	hot	14x130
6485	Boulon Demi Filetage Acier 14x130	BDFA14130	\N	\N	acier	14x130
6486	Boulon Demi Filetage Brut 14x140	BDFB14140	\N	\N	none	14x140
6487	Boulon Demi Filetage Zingué 14x140	BDFZ14140	\N	\N	cold	14x140
6488	Boulon Demi Filetage Zingué à chaud 14x140	BDFZC14140	\N	\N	hot	14x140
6489	Boulon Demi Filetage Acier 14x140	BDFA14140	\N	\N	acier	14x140
6490	Boulon Demi Filetage Brut 14x150	BDFB14150	\N	\N	none	14x150
6491	Boulon Demi Filetage Zingué 14x150	BDFZ14150	\N	\N	cold	14x150
6492	Boulon Demi Filetage Zingué à chaud 14x150	BDFZC14150	\N	\N	hot	14x150
6493	Boulon Demi Filetage Acier 14x150	BDFA14150	\N	\N	acier	14x150
6494	Boulon Demi Filetage Brut 14x160	BDFB14160	\N	\N	none	14x160
6495	Boulon Demi Filetage Zingué 14x160	BDFZ14160	\N	\N	cold	14x160
6496	Boulon Demi Filetage Zingué à chaud 14x160	BDFZC14160	\N	\N	hot	14x160
6497	Boulon Demi Filetage Acier 14x160	BDFA14160	\N	\N	acier	14x160
6498	Boulon Demi Filetage Brut 14x170	BDFB14170	\N	\N	none	14x170
6499	Boulon Demi Filetage Zingué 14x170	BDFZ14170	\N	\N	cold	14x170
6500	Boulon Demi Filetage Zingué à chaud 14x170	BDFZC14170	\N	\N	hot	14x170
6501	Boulon Demi Filetage Acier 14x170	BDFA14170	\N	\N	acier	14x170
6502	Boulon Demi Filetage Brut 14x180	BDFB14180	\N	\N	none	14x180
6503	Boulon Demi Filetage Zingué 14x180	BDFZ14180	\N	\N	cold	14x180
6504	Boulon Demi Filetage Zingué à chaud 14x180	BDFZC14180	\N	\N	hot	14x180
6505	Boulon Demi Filetage Acier 14x180	BDFA14180	\N	\N	acier	14x180
6506	Boulon Demi Filetage Brut 14x190	BDFB14190	\N	\N	none	14x190
6507	Boulon Demi Filetage Zingué 14x190	BDFZ14190	\N	\N	cold	14x190
6508	Boulon Demi Filetage Zingué à chaud 14x190	BDFZC14190	\N	\N	hot	14x190
6509	Boulon Demi Filetage Acier 14x190	BDFA14190	\N	\N	acier	14x190
6510	Boulon Demi Filetage Brut 14x200	BDFB14200	\N	\N	none	14x200
6511	Boulon Demi Filetage Zingué 14x200	BDFZ14200	\N	\N	cold	14x200
6512	Boulon Demi Filetage Zingué à chaud 14x200	BDFZC14200	\N	\N	hot	14x200
6513	Boulon Demi Filetage Acier 14x200	BDFA14200	\N	\N	acier	14x200
6514	Boulon Demi Filetage Brut 16x12	BDFB1612	\N	\N	none	16x12
6515	Boulon Demi Filetage Zingué 16x12	BDFZ1612	\N	\N	cold	16x12
6516	Boulon Demi Filetage Zingué à chaud 16x12	BDFZC1612	\N	\N	hot	16x12
6517	Boulon Demi Filetage Acier 16x12	BDFA1612	\N	\N	acier	16x12
6518	Boulon Demi Filetage Brut 16x16	BDFB1616	\N	\N	none	16x16
6519	Boulon Demi Filetage Zingué 16x16	BDFZ1616	\N	\N	cold	16x16
6520	Boulon Demi Filetage Zingué à chaud 16x16	BDFZC1616	\N	\N	hot	16x16
6521	Boulon Demi Filetage Acier 16x16	BDFA1616	\N	\N	acier	16x16
6522	Boulon Demi Filetage Brut 16x20	BDFB1620	\N	\N	none	16x20
6523	Boulon Demi Filetage Zingué 16x20	BDFZ1620	\N	\N	cold	16x20
6524	Boulon Demi Filetage Zingué à chaud 16x20	BDFZC1620	\N	\N	hot	16x20
6525	Boulon Demi Filetage Acier 16x20	BDFA1620	\N	\N	acier	16x20
6526	Boulon Demi Filetage Brut 16x25	BDFB1625	\N	\N	none	16x25
6527	Boulon Demi Filetage Zingué 16x25	BDFZ1625	\N	\N	cold	16x25
6528	Boulon Demi Filetage Zingué à chaud 16x25	BDFZC1625	\N	\N	hot	16x25
6529	Boulon Demi Filetage Acier 16x25	BDFA1625	\N	\N	acier	16x25
6530	Boulon Demi Filetage Brut 16x30	BDFB1630	\N	\N	none	16x30
6531	Boulon Demi Filetage Zingué 16x30	BDFZ1630	\N	\N	cold	16x30
6532	Boulon Demi Filetage Zingué à chaud 16x30	BDFZC1630	\N	\N	hot	16x30
6533	Boulon Demi Filetage Acier 16x30	BDFA1630	\N	\N	acier	16x30
6534	Boulon Demi Filetage Brut 16x35	BDFB1635	\N	\N	none	16x35
6535	Boulon Demi Filetage Zingué 16x35	BDFZ1635	\N	\N	cold	16x35
6536	Boulon Demi Filetage Zingué à chaud 16x35	BDFZC1635	\N	\N	hot	16x35
6537	Boulon Demi Filetage Acier 16x35	BDFA1635	\N	\N	acier	16x35
6538	Boulon Demi Filetage Brut 16x40	BDFB1640	\N	\N	none	16x40
6539	Boulon Demi Filetage Zingué 16x40	BDFZ1640	\N	\N	cold	16x40
6540	Boulon Demi Filetage Zingué à chaud 16x40	BDFZC1640	\N	\N	hot	16x40
6541	Boulon Demi Filetage Acier 16x40	BDFA1640	\N	\N	acier	16x40
6542	Boulon Demi Filetage Brut 16x45	BDFB1645	\N	\N	none	16x45
6543	Boulon Demi Filetage Zingué 16x45	BDFZ1645	\N	\N	cold	16x45
6544	Boulon Demi Filetage Zingué à chaud 16x45	BDFZC1645	\N	\N	hot	16x45
6545	Boulon Demi Filetage Acier 16x45	BDFA1645	\N	\N	acier	16x45
6546	Boulon Demi Filetage Brut 16x50	BDFB1650	\N	\N	none	16x50
6547	Boulon Demi Filetage Zingué 16x50	BDFZ1650	\N	\N	cold	16x50
6548	Boulon Demi Filetage Zingué à chaud 16x50	BDFZC1650	\N	\N	hot	16x50
6549	Boulon Demi Filetage Acier 16x50	BDFA1650	\N	\N	acier	16x50
6550	Boulon Demi Filetage Brut 16x55	BDFB1655	\N	\N	none	16x55
6551	Boulon Demi Filetage Zingué 16x55	BDFZ1655	\N	\N	cold	16x55
6552	Boulon Demi Filetage Zingué à chaud 16x55	BDFZC1655	\N	\N	hot	16x55
6553	Boulon Demi Filetage Acier 16x55	BDFA1655	\N	\N	acier	16x55
6554	Boulon Demi Filetage Brut 16x60	BDFB1660	\N	\N	none	16x60
6555	Boulon Demi Filetage Zingué 16x60	BDFZ1660	\N	\N	cold	16x60
6556	Boulon Demi Filetage Zingué à chaud 16x60	BDFZC1660	\N	\N	hot	16x60
6557	Boulon Demi Filetage Acier 16x60	BDFA1660	\N	\N	acier	16x60
6558	Boulon Demi Filetage Brut 16x65	BDFB1665	\N	\N	none	16x65
6559	Boulon Demi Filetage Zingué 16x65	BDFZ1665	\N	\N	cold	16x65
6560	Boulon Demi Filetage Zingué à chaud 16x65	BDFZC1665	\N	\N	hot	16x65
6561	Boulon Demi Filetage Acier 16x65	BDFA1665	\N	\N	acier	16x65
6562	Boulon Demi Filetage Brut 16x70	BDFB1670	\N	\N	none	16x70
6563	Boulon Demi Filetage Zingué 16x70	BDFZ1670	\N	\N	cold	16x70
6564	Boulon Demi Filetage Zingué à chaud 16x70	BDFZC1670	\N	\N	hot	16x70
6565	Boulon Demi Filetage Acier 16x70	BDFA1670	\N	\N	acier	16x70
6566	Boulon Demi Filetage Brut 16x75	BDFB1675	\N	\N	none	16x75
6567	Boulon Demi Filetage Zingué 16x75	BDFZ1675	\N	\N	cold	16x75
6568	Boulon Demi Filetage Zingué à chaud 16x75	BDFZC1675	\N	\N	hot	16x75
6569	Boulon Demi Filetage Acier 16x75	BDFA1675	\N	\N	acier	16x75
6570	Boulon Demi Filetage Brut 16x80	BDFB1680	\N	\N	none	16x80
6571	Boulon Demi Filetage Zingué 16x80	BDFZ1680	\N	\N	cold	16x80
6572	Boulon Demi Filetage Zingué à chaud 16x80	BDFZC1680	\N	\N	hot	16x80
6573	Boulon Demi Filetage Acier 16x80	BDFA1680	\N	\N	acier	16x80
6574	Boulon Demi Filetage Brut 16x85	BDFB1685	\N	\N	none	16x85
6575	Boulon Demi Filetage Zingué 16x85	BDFZ1685	\N	\N	cold	16x85
6576	Boulon Demi Filetage Zingué à chaud 16x85	BDFZC1685	\N	\N	hot	16x85
6577	Boulon Demi Filetage Acier 16x85	BDFA1685	\N	\N	acier	16x85
6578	Boulon Demi Filetage Brut 16x90	BDFB1690	\N	\N	none	16x90
6579	Boulon Demi Filetage Zingué 16x90	BDFZ1690	\N	\N	cold	16x90
6580	Boulon Demi Filetage Zingué à chaud 16x90	BDFZC1690	\N	\N	hot	16x90
6581	Boulon Demi Filetage Acier 16x90	BDFA1690	\N	\N	acier	16x90
6582	Boulon Demi Filetage Brut 16x100	BDFB16100	\N	\N	none	16x100
6583	Boulon Demi Filetage Zingué 16x100	BDFZ16100	\N	\N	cold	16x100
6584	Boulon Demi Filetage Zingué à chaud 16x100	BDFZC16100	\N	\N	hot	16x100
6585	Boulon Demi Filetage Acier 16x100	BDFA16100	\N	\N	acier	16x100
6586	Boulon Demi Filetage Brut 16x110	BDFB16110	\N	\N	none	16x110
6587	Boulon Demi Filetage Zingué 16x110	BDFZ16110	\N	\N	cold	16x110
6588	Boulon Demi Filetage Zingué à chaud 16x110	BDFZC16110	\N	\N	hot	16x110
6589	Boulon Demi Filetage Acier 16x110	BDFA16110	\N	\N	acier	16x110
6590	Boulon Demi Filetage Brut 16x120	BDFB16120	\N	\N	none	16x120
6591	Boulon Demi Filetage Zingué 16x120	BDFZ16120	\N	\N	cold	16x120
6592	Boulon Demi Filetage Zingué à chaud 16x120	BDFZC16120	\N	\N	hot	16x120
6593	Boulon Demi Filetage Acier 16x120	BDFA16120	\N	\N	acier	16x120
6594	Boulon Demi Filetage Brut 16x130	BDFB16130	\N	\N	none	16x130
6595	Boulon Demi Filetage Zingué 16x130	BDFZ16130	\N	\N	cold	16x130
6596	Boulon Demi Filetage Zingué à chaud 16x130	BDFZC16130	\N	\N	hot	16x130
6597	Boulon Demi Filetage Acier 16x130	BDFA16130	\N	\N	acier	16x130
6598	Boulon Demi Filetage Brut 16x140	BDFB16140	\N	\N	none	16x140
6599	Boulon Demi Filetage Zingué 16x140	BDFZ16140	\N	\N	cold	16x140
6600	Boulon Demi Filetage Zingué à chaud 16x140	BDFZC16140	\N	\N	hot	16x140
6601	Boulon Demi Filetage Acier 16x140	BDFA16140	\N	\N	acier	16x140
6602	Boulon Demi Filetage Brut 16x150	BDFB16150	\N	\N	none	16x150
6603	Boulon Demi Filetage Zingué 16x150	BDFZ16150	\N	\N	cold	16x150
6604	Boulon Demi Filetage Zingué à chaud 16x150	BDFZC16150	\N	\N	hot	16x150
6605	Boulon Demi Filetage Acier 16x150	BDFA16150	\N	\N	acier	16x150
6606	Boulon Demi Filetage Brut 16x160	BDFB16160	\N	\N	none	16x160
6607	Boulon Demi Filetage Zingué 16x160	BDFZ16160	\N	\N	cold	16x160
6608	Boulon Demi Filetage Zingué à chaud 16x160	BDFZC16160	\N	\N	hot	16x160
6609	Boulon Demi Filetage Acier 16x160	BDFA16160	\N	\N	acier	16x160
6610	Boulon Demi Filetage Brut 16x170	BDFB16170	\N	\N	none	16x170
6611	Boulon Demi Filetage Zingué 16x170	BDFZ16170	\N	\N	cold	16x170
6612	Boulon Demi Filetage Zingué à chaud 16x170	BDFZC16170	\N	\N	hot	16x170
6613	Boulon Demi Filetage Acier 16x170	BDFA16170	\N	\N	acier	16x170
6614	Boulon Demi Filetage Brut 16x180	BDFB16180	\N	\N	none	16x180
6615	Boulon Demi Filetage Zingué 16x180	BDFZ16180	\N	\N	cold	16x180
6616	Boulon Demi Filetage Zingué à chaud 16x180	BDFZC16180	\N	\N	hot	16x180
6617	Boulon Demi Filetage Acier 16x180	BDFA16180	\N	\N	acier	16x180
6618	Boulon Demi Filetage Brut 16x190	BDFB16190	\N	\N	none	16x190
6619	Boulon Demi Filetage Zingué 16x190	BDFZ16190	\N	\N	cold	16x190
6620	Boulon Demi Filetage Zingué à chaud 16x190	BDFZC16190	\N	\N	hot	16x190
6621	Boulon Demi Filetage Acier 16x190	BDFA16190	\N	\N	acier	16x190
6622	Boulon Demi Filetage Brut 16x200	BDFB16200	\N	\N	none	16x200
6623	Boulon Demi Filetage Zingué 16x200	BDFZ16200	\N	\N	cold	16x200
6624	Boulon Demi Filetage Zingué à chaud 16x200	BDFZC16200	\N	\N	hot	16x200
6625	Boulon Demi Filetage Acier 16x200	BDFA16200	\N	\N	acier	16x200
6626	Boulon Demi Filetage Brut 18x12	BDFB1812	\N	\N	none	18x12
6627	Boulon Demi Filetage Zingué 18x12	BDFZ1812	\N	\N	cold	18x12
6628	Boulon Demi Filetage Zingué à chaud 18x12	BDFZC1812	\N	\N	hot	18x12
6629	Boulon Demi Filetage Acier 18x12	BDFA1812	\N	\N	acier	18x12
6630	Boulon Demi Filetage Brut 18x16	BDFB1816	\N	\N	none	18x16
6631	Boulon Demi Filetage Zingué 18x16	BDFZ1816	\N	\N	cold	18x16
6632	Boulon Demi Filetage Zingué à chaud 18x16	BDFZC1816	\N	\N	hot	18x16
6633	Boulon Demi Filetage Acier 18x16	BDFA1816	\N	\N	acier	18x16
6634	Boulon Demi Filetage Brut 18x20	BDFB1820	\N	\N	none	18x20
6635	Boulon Demi Filetage Zingué 18x20	BDFZ1820	\N	\N	cold	18x20
6636	Boulon Demi Filetage Zingué à chaud 18x20	BDFZC1820	\N	\N	hot	18x20
6637	Boulon Demi Filetage Acier 18x20	BDFA1820	\N	\N	acier	18x20
6638	Boulon Demi Filetage Brut 18x25	BDFB1825	\N	\N	none	18x25
6639	Boulon Demi Filetage Zingué 18x25	BDFZ1825	\N	\N	cold	18x25
6640	Boulon Demi Filetage Zingué à chaud 18x25	BDFZC1825	\N	\N	hot	18x25
6641	Boulon Demi Filetage Acier 18x25	BDFA1825	\N	\N	acier	18x25
6642	Boulon Demi Filetage Brut 18x30	BDFB1830	\N	\N	none	18x30
6643	Boulon Demi Filetage Zingué 18x30	BDFZ1830	\N	\N	cold	18x30
6644	Boulon Demi Filetage Zingué à chaud 18x30	BDFZC1830	\N	\N	hot	18x30
6645	Boulon Demi Filetage Acier 18x30	BDFA1830	\N	\N	acier	18x30
6646	Boulon Demi Filetage Brut 18x35	BDFB1835	\N	\N	none	18x35
6647	Boulon Demi Filetage Zingué 18x35	BDFZ1835	\N	\N	cold	18x35
6648	Boulon Demi Filetage Zingué à chaud 18x35	BDFZC1835	\N	\N	hot	18x35
6649	Boulon Demi Filetage Acier 18x35	BDFA1835	\N	\N	acier	18x35
6650	Boulon Demi Filetage Brut 18x40	BDFB1840	\N	\N	none	18x40
6651	Boulon Demi Filetage Zingué 18x40	BDFZ1840	\N	\N	cold	18x40
6652	Boulon Demi Filetage Zingué à chaud 18x40	BDFZC1840	\N	\N	hot	18x40
6653	Boulon Demi Filetage Acier 18x40	BDFA1840	\N	\N	acier	18x40
6654	Boulon Demi Filetage Brut 18x45	BDFB1845	\N	\N	none	18x45
6655	Boulon Demi Filetage Zingué 18x45	BDFZ1845	\N	\N	cold	18x45
6656	Boulon Demi Filetage Zingué à chaud 18x45	BDFZC1845	\N	\N	hot	18x45
6657	Boulon Demi Filetage Acier 18x45	BDFA1845	\N	\N	acier	18x45
6658	Boulon Demi Filetage Brut 18x50	BDFB1850	\N	\N	none	18x50
6659	Boulon Demi Filetage Zingué 18x50	BDFZ1850	\N	\N	cold	18x50
6660	Boulon Demi Filetage Zingué à chaud 18x50	BDFZC1850	\N	\N	hot	18x50
6661	Boulon Demi Filetage Acier 18x50	BDFA1850	\N	\N	acier	18x50
6662	Boulon Demi Filetage Brut 18x55	BDFB1855	\N	\N	none	18x55
6663	Boulon Demi Filetage Zingué 18x55	BDFZ1855	\N	\N	cold	18x55
6664	Boulon Demi Filetage Zingué à chaud 18x55	BDFZC1855	\N	\N	hot	18x55
6665	Boulon Demi Filetage Acier 18x55	BDFA1855	\N	\N	acier	18x55
6666	Boulon Demi Filetage Brut 18x60	BDFB1860	\N	\N	none	18x60
6667	Boulon Demi Filetage Zingué 18x60	BDFZ1860	\N	\N	cold	18x60
6668	Boulon Demi Filetage Zingué à chaud 18x60	BDFZC1860	\N	\N	hot	18x60
6669	Boulon Demi Filetage Acier 18x60	BDFA1860	\N	\N	acier	18x60
6670	Boulon Demi Filetage Brut 18x65	BDFB1865	\N	\N	none	18x65
6671	Boulon Demi Filetage Zingué 18x65	BDFZ1865	\N	\N	cold	18x65
6672	Boulon Demi Filetage Zingué à chaud 18x65	BDFZC1865	\N	\N	hot	18x65
6673	Boulon Demi Filetage Acier 18x65	BDFA1865	\N	\N	acier	18x65
6674	Boulon Demi Filetage Brut 18x70	BDFB1870	\N	\N	none	18x70
6675	Boulon Demi Filetage Zingué 18x70	BDFZ1870	\N	\N	cold	18x70
6676	Boulon Demi Filetage Zingué à chaud 18x70	BDFZC1870	\N	\N	hot	18x70
6677	Boulon Demi Filetage Acier 18x70	BDFA1870	\N	\N	acier	18x70
6678	Boulon Demi Filetage Brut 18x75	BDFB1875	\N	\N	none	18x75
6679	Boulon Demi Filetage Zingué 18x75	BDFZ1875	\N	\N	cold	18x75
6680	Boulon Demi Filetage Zingué à chaud 18x75	BDFZC1875	\N	\N	hot	18x75
6681	Boulon Demi Filetage Acier 18x75	BDFA1875	\N	\N	acier	18x75
6682	Boulon Demi Filetage Brut 18x80	BDFB1880	\N	\N	none	18x80
6683	Boulon Demi Filetage Zingué 18x80	BDFZ1880	\N	\N	cold	18x80
6684	Boulon Demi Filetage Zingué à chaud 18x80	BDFZC1880	\N	\N	hot	18x80
6685	Boulon Demi Filetage Acier 18x80	BDFA1880	\N	\N	acier	18x80
6686	Boulon Demi Filetage Brut 18x85	BDFB1885	\N	\N	none	18x85
6687	Boulon Demi Filetage Zingué 18x85	BDFZ1885	\N	\N	cold	18x85
6688	Boulon Demi Filetage Zingué à chaud 18x85	BDFZC1885	\N	\N	hot	18x85
6689	Boulon Demi Filetage Acier 18x85	BDFA1885	\N	\N	acier	18x85
6690	Boulon Demi Filetage Brut 18x90	BDFB1890	\N	\N	none	18x90
6691	Boulon Demi Filetage Zingué 18x90	BDFZ1890	\N	\N	cold	18x90
6692	Boulon Demi Filetage Zingué à chaud 18x90	BDFZC1890	\N	\N	hot	18x90
6693	Boulon Demi Filetage Acier 18x90	BDFA1890	\N	\N	acier	18x90
6694	Boulon Demi Filetage Brut 18x100	BDFB18100	\N	\N	none	18x100
6695	Boulon Demi Filetage Zingué 18x100	BDFZ18100	\N	\N	cold	18x100
6696	Boulon Demi Filetage Zingué à chaud 18x100	BDFZC18100	\N	\N	hot	18x100
6697	Boulon Demi Filetage Acier 18x100	BDFA18100	\N	\N	acier	18x100
6698	Boulon Demi Filetage Brut 18x110	BDFB18110	\N	\N	none	18x110
6699	Boulon Demi Filetage Zingué 18x110	BDFZ18110	\N	\N	cold	18x110
6700	Boulon Demi Filetage Zingué à chaud 18x110	BDFZC18110	\N	\N	hot	18x110
6701	Boulon Demi Filetage Acier 18x110	BDFA18110	\N	\N	acier	18x110
6702	Boulon Demi Filetage Brut 18x120	BDFB18120	\N	\N	none	18x120
6703	Boulon Demi Filetage Zingué 18x120	BDFZ18120	\N	\N	cold	18x120
6704	Boulon Demi Filetage Zingué à chaud 18x120	BDFZC18120	\N	\N	hot	18x120
6705	Boulon Demi Filetage Acier 18x120	BDFA18120	\N	\N	acier	18x120
6706	Boulon Demi Filetage Brut 18x130	BDFB18130	\N	\N	none	18x130
6707	Boulon Demi Filetage Zingué 18x130	BDFZ18130	\N	\N	cold	18x130
6708	Boulon Demi Filetage Zingué à chaud 18x130	BDFZC18130	\N	\N	hot	18x130
6709	Boulon Demi Filetage Acier 18x130	BDFA18130	\N	\N	acier	18x130
6710	Boulon Demi Filetage Brut 18x140	BDFB18140	\N	\N	none	18x140
6711	Boulon Demi Filetage Zingué 18x140	BDFZ18140	\N	\N	cold	18x140
6712	Boulon Demi Filetage Zingué à chaud 18x140	BDFZC18140	\N	\N	hot	18x140
6713	Boulon Demi Filetage Acier 18x140	BDFA18140	\N	\N	acier	18x140
6714	Boulon Demi Filetage Brut 18x150	BDFB18150	\N	\N	none	18x150
6715	Boulon Demi Filetage Zingué 18x150	BDFZ18150	\N	\N	cold	18x150
6716	Boulon Demi Filetage Zingué à chaud 18x150	BDFZC18150	\N	\N	hot	18x150
6717	Boulon Demi Filetage Acier 18x150	BDFA18150	\N	\N	acier	18x150
6718	Boulon Demi Filetage Brut 18x160	BDFB18160	\N	\N	none	18x160
6719	Boulon Demi Filetage Zingué 18x160	BDFZ18160	\N	\N	cold	18x160
6720	Boulon Demi Filetage Zingué à chaud 18x160	BDFZC18160	\N	\N	hot	18x160
6721	Boulon Demi Filetage Acier 18x160	BDFA18160	\N	\N	acier	18x160
6722	Boulon Demi Filetage Brut 18x170	BDFB18170	\N	\N	none	18x170
6723	Boulon Demi Filetage Zingué 18x170	BDFZ18170	\N	\N	cold	18x170
6724	Boulon Demi Filetage Zingué à chaud 18x170	BDFZC18170	\N	\N	hot	18x170
6725	Boulon Demi Filetage Acier 18x170	BDFA18170	\N	\N	acier	18x170
6726	Boulon Demi Filetage Brut 18x180	BDFB18180	\N	\N	none	18x180
6727	Boulon Demi Filetage Zingué 18x180	BDFZ18180	\N	\N	cold	18x180
6728	Boulon Demi Filetage Zingué à chaud 18x180	BDFZC18180	\N	\N	hot	18x180
6729	Boulon Demi Filetage Acier 18x180	BDFA18180	\N	\N	acier	18x180
6730	Boulon Demi Filetage Brut 18x190	BDFB18190	\N	\N	none	18x190
6731	Boulon Demi Filetage Zingué 18x190	BDFZ18190	\N	\N	cold	18x190
6732	Boulon Demi Filetage Zingué à chaud 18x190	BDFZC18190	\N	\N	hot	18x190
6733	Boulon Demi Filetage Acier 18x190	BDFA18190	\N	\N	acier	18x190
6734	Boulon Demi Filetage Brut 18x200	BDFB18200	\N	\N	none	18x200
6735	Boulon Demi Filetage Zingué 18x200	BDFZ18200	\N	\N	cold	18x200
6736	Boulon Demi Filetage Zingué à chaud 18x200	BDFZC18200	\N	\N	hot	18x200
6737	Boulon Demi Filetage Acier 18x200	BDFA18200	\N	\N	acier	18x200
6738	Boulon Demi Filetage Brut 20x12	BDFB2012	\N	\N	none	20x12
6739	Boulon Demi Filetage Zingué 20x12	BDFZ2012	\N	\N	cold	20x12
6740	Boulon Demi Filetage Zingué à chaud 20x12	BDFZC2012	\N	\N	hot	20x12
6741	Boulon Demi Filetage Acier 20x12	BDFA2012	\N	\N	acier	20x12
6742	Boulon Demi Filetage Brut 20x16	BDFB2016	\N	\N	none	20x16
6743	Boulon Demi Filetage Zingué 20x16	BDFZ2016	\N	\N	cold	20x16
6744	Boulon Demi Filetage Zingué à chaud 20x16	BDFZC2016	\N	\N	hot	20x16
6745	Boulon Demi Filetage Acier 20x16	BDFA2016	\N	\N	acier	20x16
6746	Boulon Demi Filetage Brut 20x20	BDFB2020	\N	\N	none	20x20
6747	Boulon Demi Filetage Zingué 20x20	BDFZ2020	\N	\N	cold	20x20
6748	Boulon Demi Filetage Zingué à chaud 20x20	BDFZC2020	\N	\N	hot	20x20
6749	Boulon Demi Filetage Acier 20x20	BDFA2020	\N	\N	acier	20x20
6750	Boulon Demi Filetage Brut 20x25	BDFB2025	\N	\N	none	20x25
6751	Boulon Demi Filetage Zingué 20x25	BDFZ2025	\N	\N	cold	20x25
6752	Boulon Demi Filetage Zingué à chaud 20x25	BDFZC2025	\N	\N	hot	20x25
6753	Boulon Demi Filetage Acier 20x25	BDFA2025	\N	\N	acier	20x25
6754	Boulon Demi Filetage Brut 20x30	BDFB2030	\N	\N	none	20x30
6755	Boulon Demi Filetage Zingué 20x30	BDFZ2030	\N	\N	cold	20x30
6756	Boulon Demi Filetage Zingué à chaud 20x30	BDFZC2030	\N	\N	hot	20x30
6757	Boulon Demi Filetage Acier 20x30	BDFA2030	\N	\N	acier	20x30
6758	Boulon Demi Filetage Brut 20x35	BDFB2035	\N	\N	none	20x35
6759	Boulon Demi Filetage Zingué 20x35	BDFZ2035	\N	\N	cold	20x35
6760	Boulon Demi Filetage Zingué à chaud 20x35	BDFZC2035	\N	\N	hot	20x35
6761	Boulon Demi Filetage Acier 20x35	BDFA2035	\N	\N	acier	20x35
6762	Boulon Demi Filetage Brut 20x40	BDFB2040	\N	\N	none	20x40
6763	Boulon Demi Filetage Zingué 20x40	BDFZ2040	\N	\N	cold	20x40
6764	Boulon Demi Filetage Zingué à chaud 20x40	BDFZC2040	\N	\N	hot	20x40
6765	Boulon Demi Filetage Acier 20x40	BDFA2040	\N	\N	acier	20x40
6766	Boulon Demi Filetage Brut 20x45	BDFB2045	\N	\N	none	20x45
6767	Boulon Demi Filetage Zingué 20x45	BDFZ2045	\N	\N	cold	20x45
6768	Boulon Demi Filetage Zingué à chaud 20x45	BDFZC2045	\N	\N	hot	20x45
6769	Boulon Demi Filetage Acier 20x45	BDFA2045	\N	\N	acier	20x45
6770	Boulon Demi Filetage Brut 20x50	BDFB2050	\N	\N	none	20x50
6771	Boulon Demi Filetage Zingué 20x50	BDFZ2050	\N	\N	cold	20x50
6772	Boulon Demi Filetage Zingué à chaud 20x50	BDFZC2050	\N	\N	hot	20x50
6773	Boulon Demi Filetage Acier 20x50	BDFA2050	\N	\N	acier	20x50
6774	Boulon Demi Filetage Brut 20x55	BDFB2055	\N	\N	none	20x55
6775	Boulon Demi Filetage Zingué 20x55	BDFZ2055	\N	\N	cold	20x55
6776	Boulon Demi Filetage Zingué à chaud 20x55	BDFZC2055	\N	\N	hot	20x55
6777	Boulon Demi Filetage Acier 20x55	BDFA2055	\N	\N	acier	20x55
6778	Boulon Demi Filetage Brut 20x60	BDFB2060	\N	\N	none	20x60
6779	Boulon Demi Filetage Zingué 20x60	BDFZ2060	\N	\N	cold	20x60
6780	Boulon Demi Filetage Zingué à chaud 20x60	BDFZC2060	\N	\N	hot	20x60
6781	Boulon Demi Filetage Acier 20x60	BDFA2060	\N	\N	acier	20x60
6782	Boulon Demi Filetage Brut 20x65	BDFB2065	\N	\N	none	20x65
6783	Boulon Demi Filetage Zingué 20x65	BDFZ2065	\N	\N	cold	20x65
6784	Boulon Demi Filetage Zingué à chaud 20x65	BDFZC2065	\N	\N	hot	20x65
6785	Boulon Demi Filetage Acier 20x65	BDFA2065	\N	\N	acier	20x65
6786	Boulon Demi Filetage Brut 20x70	BDFB2070	\N	\N	none	20x70
6787	Boulon Demi Filetage Zingué 20x70	BDFZ2070	\N	\N	cold	20x70
6788	Boulon Demi Filetage Zingué à chaud 20x70	BDFZC2070	\N	\N	hot	20x70
6789	Boulon Demi Filetage Acier 20x70	BDFA2070	\N	\N	acier	20x70
6790	Boulon Demi Filetage Brut 20x75	BDFB2075	\N	\N	none	20x75
6791	Boulon Demi Filetage Zingué 20x75	BDFZ2075	\N	\N	cold	20x75
6792	Boulon Demi Filetage Zingué à chaud 20x75	BDFZC2075	\N	\N	hot	20x75
6793	Boulon Demi Filetage Acier 20x75	BDFA2075	\N	\N	acier	20x75
6794	Boulon Demi Filetage Brut 20x80	BDFB2080	\N	\N	none	20x80
6795	Boulon Demi Filetage Zingué 20x80	BDFZ2080	\N	\N	cold	20x80
6796	Boulon Demi Filetage Zingué à chaud 20x80	BDFZC2080	\N	\N	hot	20x80
6797	Boulon Demi Filetage Acier 20x80	BDFA2080	\N	\N	acier	20x80
6798	Boulon Demi Filetage Brut 20x85	BDFB2085	\N	\N	none	20x85
6799	Boulon Demi Filetage Zingué 20x85	BDFZ2085	\N	\N	cold	20x85
6800	Boulon Demi Filetage Zingué à chaud 20x85	BDFZC2085	\N	\N	hot	20x85
6801	Boulon Demi Filetage Acier 20x85	BDFA2085	\N	\N	acier	20x85
6802	Boulon Demi Filetage Brut 20x90	BDFB2090	\N	\N	none	20x90
6803	Boulon Demi Filetage Zingué 20x90	BDFZ2090	\N	\N	cold	20x90
6804	Boulon Demi Filetage Zingué à chaud 20x90	BDFZC2090	\N	\N	hot	20x90
6805	Boulon Demi Filetage Acier 20x90	BDFA2090	\N	\N	acier	20x90
6806	Boulon Demi Filetage Brut 20x100	BDFB20100	\N	\N	none	20x100
6807	Boulon Demi Filetage Zingué 20x100	BDFZ20100	\N	\N	cold	20x100
6808	Boulon Demi Filetage Zingué à chaud 20x100	BDFZC20100	\N	\N	hot	20x100
6809	Boulon Demi Filetage Acier 20x100	BDFA20100	\N	\N	acier	20x100
6810	Boulon Demi Filetage Brut 20x110	BDFB20110	\N	\N	none	20x110
6811	Boulon Demi Filetage Zingué 20x110	BDFZ20110	\N	\N	cold	20x110
6812	Boulon Demi Filetage Zingué à chaud 20x110	BDFZC20110	\N	\N	hot	20x110
6813	Boulon Demi Filetage Acier 20x110	BDFA20110	\N	\N	acier	20x110
6814	Boulon Demi Filetage Brut 20x120	BDFB20120	\N	\N	none	20x120
6815	Boulon Demi Filetage Zingué 20x120	BDFZ20120	\N	\N	cold	20x120
6816	Boulon Demi Filetage Zingué à chaud 20x120	BDFZC20120	\N	\N	hot	20x120
6817	Boulon Demi Filetage Acier 20x120	BDFA20120	\N	\N	acier	20x120
6818	Boulon Demi Filetage Brut 20x130	BDFB20130	\N	\N	none	20x130
6819	Boulon Demi Filetage Zingué 20x130	BDFZ20130	\N	\N	cold	20x130
6820	Boulon Demi Filetage Zingué à chaud 20x130	BDFZC20130	\N	\N	hot	20x130
6821	Boulon Demi Filetage Acier 20x130	BDFA20130	\N	\N	acier	20x130
6822	Boulon Demi Filetage Brut 20x140	BDFB20140	\N	\N	none	20x140
6823	Boulon Demi Filetage Zingué 20x140	BDFZ20140	\N	\N	cold	20x140
6824	Boulon Demi Filetage Zingué à chaud 20x140	BDFZC20140	\N	\N	hot	20x140
6825	Boulon Demi Filetage Acier 20x140	BDFA20140	\N	\N	acier	20x140
6826	Boulon Demi Filetage Brut 20x150	BDFB20150	\N	\N	none	20x150
6827	Boulon Demi Filetage Zingué 20x150	BDFZ20150	\N	\N	cold	20x150
6828	Boulon Demi Filetage Zingué à chaud 20x150	BDFZC20150	\N	\N	hot	20x150
6829	Boulon Demi Filetage Acier 20x150	BDFA20150	\N	\N	acier	20x150
6830	Boulon Demi Filetage Brut 20x160	BDFB20160	\N	\N	none	20x160
6831	Boulon Demi Filetage Zingué 20x160	BDFZ20160	\N	\N	cold	20x160
6832	Boulon Demi Filetage Zingué à chaud 20x160	BDFZC20160	\N	\N	hot	20x160
6833	Boulon Demi Filetage Acier 20x160	BDFA20160	\N	\N	acier	20x160
6834	Boulon Demi Filetage Brut 20x170	BDFB20170	\N	\N	none	20x170
6835	Boulon Demi Filetage Zingué 20x170	BDFZ20170	\N	\N	cold	20x170
6836	Boulon Demi Filetage Zingué à chaud 20x170	BDFZC20170	\N	\N	hot	20x170
6837	Boulon Demi Filetage Acier 20x170	BDFA20170	\N	\N	acier	20x170
6838	Boulon Demi Filetage Brut 20x180	BDFB20180	\N	\N	none	20x180
6839	Boulon Demi Filetage Zingué 20x180	BDFZ20180	\N	\N	cold	20x180
6840	Boulon Demi Filetage Zingué à chaud 20x180	BDFZC20180	\N	\N	hot	20x180
6841	Boulon Demi Filetage Acier 20x180	BDFA20180	\N	\N	acier	20x180
6842	Boulon Demi Filetage Brut 20x190	BDFB20190	\N	\N	none	20x190
6843	Boulon Demi Filetage Zingué 20x190	BDFZ20190	\N	\N	cold	20x190
6844	Boulon Demi Filetage Zingué à chaud 20x190	BDFZC20190	\N	\N	hot	20x190
6845	Boulon Demi Filetage Acier 20x190	BDFA20190	\N	\N	acier	20x190
6846	Boulon Demi Filetage Brut 20x200	BDFB20200	\N	\N	none	20x200
6847	Boulon Demi Filetage Zingué 20x200	BDFZ20200	\N	\N	cold	20x200
6848	Boulon Demi Filetage Zingué à chaud 20x200	BDFZC20200	\N	\N	hot	20x200
6849	Boulon Demi Filetage Acier 20x200	BDFA20200	\N	\N	acier	20x200
6850	Boulon Demi Filetage Brut 22x12	BDFB2212	\N	\N	none	22x12
6851	Boulon Demi Filetage Zingué 22x12	BDFZ2212	\N	\N	cold	22x12
6852	Boulon Demi Filetage Zingué à chaud 22x12	BDFZC2212	\N	\N	hot	22x12
6853	Boulon Demi Filetage Acier 22x12	BDFA2212	\N	\N	acier	22x12
6854	Boulon Demi Filetage Brut 22x16	BDFB2216	\N	\N	none	22x16
6855	Boulon Demi Filetage Zingué 22x16	BDFZ2216	\N	\N	cold	22x16
6856	Boulon Demi Filetage Zingué à chaud 22x16	BDFZC2216	\N	\N	hot	22x16
6857	Boulon Demi Filetage Acier 22x16	BDFA2216	\N	\N	acier	22x16
6858	Boulon Demi Filetage Brut 22x20	BDFB2220	\N	\N	none	22x20
6859	Boulon Demi Filetage Zingué 22x20	BDFZ2220	\N	\N	cold	22x20
6860	Boulon Demi Filetage Zingué à chaud 22x20	BDFZC2220	\N	\N	hot	22x20
6861	Boulon Demi Filetage Acier 22x20	BDFA2220	\N	\N	acier	22x20
6862	Boulon Demi Filetage Brut 22x25	BDFB2225	\N	\N	none	22x25
6863	Boulon Demi Filetage Zingué 22x25	BDFZ2225	\N	\N	cold	22x25
6864	Boulon Demi Filetage Zingué à chaud 22x25	BDFZC2225	\N	\N	hot	22x25
6865	Boulon Demi Filetage Acier 22x25	BDFA2225	\N	\N	acier	22x25
6866	Boulon Demi Filetage Brut 22x30	BDFB2230	\N	\N	none	22x30
6867	Boulon Demi Filetage Zingué 22x30	BDFZ2230	\N	\N	cold	22x30
6868	Boulon Demi Filetage Zingué à chaud 22x30	BDFZC2230	\N	\N	hot	22x30
6869	Boulon Demi Filetage Acier 22x30	BDFA2230	\N	\N	acier	22x30
6870	Boulon Demi Filetage Brut 22x35	BDFB2235	\N	\N	none	22x35
6871	Boulon Demi Filetage Zingué 22x35	BDFZ2235	\N	\N	cold	22x35
6872	Boulon Demi Filetage Zingué à chaud 22x35	BDFZC2235	\N	\N	hot	22x35
6873	Boulon Demi Filetage Acier 22x35	BDFA2235	\N	\N	acier	22x35
6874	Boulon Demi Filetage Brut 22x40	BDFB2240	\N	\N	none	22x40
6875	Boulon Demi Filetage Zingué 22x40	BDFZ2240	\N	\N	cold	22x40
6876	Boulon Demi Filetage Zingué à chaud 22x40	BDFZC2240	\N	\N	hot	22x40
6877	Boulon Demi Filetage Acier 22x40	BDFA2240	\N	\N	acier	22x40
6878	Boulon Demi Filetage Brut 22x45	BDFB2245	\N	\N	none	22x45
6879	Boulon Demi Filetage Zingué 22x45	BDFZ2245	\N	\N	cold	22x45
6880	Boulon Demi Filetage Zingué à chaud 22x45	BDFZC2245	\N	\N	hot	22x45
6881	Boulon Demi Filetage Acier 22x45	BDFA2245	\N	\N	acier	22x45
6882	Boulon Demi Filetage Brut 22x50	BDFB2250	\N	\N	none	22x50
6883	Boulon Demi Filetage Zingué 22x50	BDFZ2250	\N	\N	cold	22x50
6884	Boulon Demi Filetage Zingué à chaud 22x50	BDFZC2250	\N	\N	hot	22x50
6885	Boulon Demi Filetage Acier 22x50	BDFA2250	\N	\N	acier	22x50
6886	Boulon Demi Filetage Brut 22x55	BDFB2255	\N	\N	none	22x55
6887	Boulon Demi Filetage Zingué 22x55	BDFZ2255	\N	\N	cold	22x55
6888	Boulon Demi Filetage Zingué à chaud 22x55	BDFZC2255	\N	\N	hot	22x55
6889	Boulon Demi Filetage Acier 22x55	BDFA2255	\N	\N	acier	22x55
6890	Boulon Demi Filetage Brut 22x60	BDFB2260	\N	\N	none	22x60
6891	Boulon Demi Filetage Zingué 22x60	BDFZ2260	\N	\N	cold	22x60
6892	Boulon Demi Filetage Zingué à chaud 22x60	BDFZC2260	\N	\N	hot	22x60
6893	Boulon Demi Filetage Acier 22x60	BDFA2260	\N	\N	acier	22x60
6894	Boulon Demi Filetage Brut 22x65	BDFB2265	\N	\N	none	22x65
6895	Boulon Demi Filetage Zingué 22x65	BDFZ2265	\N	\N	cold	22x65
6896	Boulon Demi Filetage Zingué à chaud 22x65	BDFZC2265	\N	\N	hot	22x65
6897	Boulon Demi Filetage Acier 22x65	BDFA2265	\N	\N	acier	22x65
6898	Boulon Demi Filetage Brut 22x70	BDFB2270	\N	\N	none	22x70
6899	Boulon Demi Filetage Zingué 22x70	BDFZ2270	\N	\N	cold	22x70
6900	Boulon Demi Filetage Zingué à chaud 22x70	BDFZC2270	\N	\N	hot	22x70
6901	Boulon Demi Filetage Acier 22x70	BDFA2270	\N	\N	acier	22x70
6902	Boulon Demi Filetage Brut 22x75	BDFB2275	\N	\N	none	22x75
6903	Boulon Demi Filetage Zingué 22x75	BDFZ2275	\N	\N	cold	22x75
6904	Boulon Demi Filetage Zingué à chaud 22x75	BDFZC2275	\N	\N	hot	22x75
6905	Boulon Demi Filetage Acier 22x75	BDFA2275	\N	\N	acier	22x75
6906	Boulon Demi Filetage Brut 22x80	BDFB2280	\N	\N	none	22x80
6907	Boulon Demi Filetage Zingué 22x80	BDFZ2280	\N	\N	cold	22x80
6908	Boulon Demi Filetage Zingué à chaud 22x80	BDFZC2280	\N	\N	hot	22x80
6909	Boulon Demi Filetage Acier 22x80	BDFA2280	\N	\N	acier	22x80
6910	Boulon Demi Filetage Brut 22x85	BDFB2285	\N	\N	none	22x85
6911	Boulon Demi Filetage Zingué 22x85	BDFZ2285	\N	\N	cold	22x85
6912	Boulon Demi Filetage Zingué à chaud 22x85	BDFZC2285	\N	\N	hot	22x85
6913	Boulon Demi Filetage Acier 22x85	BDFA2285	\N	\N	acier	22x85
6914	Boulon Demi Filetage Brut 22x90	BDFB2290	\N	\N	none	22x90
6915	Boulon Demi Filetage Zingué 22x90	BDFZ2290	\N	\N	cold	22x90
6916	Boulon Demi Filetage Zingué à chaud 22x90	BDFZC2290	\N	\N	hot	22x90
6917	Boulon Demi Filetage Acier 22x90	BDFA2290	\N	\N	acier	22x90
6918	Boulon Demi Filetage Brut 22x100	BDFB22100	\N	\N	none	22x100
6919	Boulon Demi Filetage Zingué 22x100	BDFZ22100	\N	\N	cold	22x100
6920	Boulon Demi Filetage Zingué à chaud 22x100	BDFZC22100	\N	\N	hot	22x100
6921	Boulon Demi Filetage Acier 22x100	BDFA22100	\N	\N	acier	22x100
6922	Boulon Demi Filetage Brut 22x110	BDFB22110	\N	\N	none	22x110
6923	Boulon Demi Filetage Zingué 22x110	BDFZ22110	\N	\N	cold	22x110
6924	Boulon Demi Filetage Zingué à chaud 22x110	BDFZC22110	\N	\N	hot	22x110
6925	Boulon Demi Filetage Acier 22x110	BDFA22110	\N	\N	acier	22x110
6926	Boulon Demi Filetage Brut 22x120	BDFB22120	\N	\N	none	22x120
6927	Boulon Demi Filetage Zingué 22x120	BDFZ22120	\N	\N	cold	22x120
6928	Boulon Demi Filetage Zingué à chaud 22x120	BDFZC22120	\N	\N	hot	22x120
6929	Boulon Demi Filetage Acier 22x120	BDFA22120	\N	\N	acier	22x120
6930	Boulon Demi Filetage Brut 22x130	BDFB22130	\N	\N	none	22x130
6931	Boulon Demi Filetage Zingué 22x130	BDFZ22130	\N	\N	cold	22x130
6932	Boulon Demi Filetage Zingué à chaud 22x130	BDFZC22130	\N	\N	hot	22x130
6933	Boulon Demi Filetage Acier 22x130	BDFA22130	\N	\N	acier	22x130
6934	Boulon Demi Filetage Brut 22x140	BDFB22140	\N	\N	none	22x140
6935	Boulon Demi Filetage Zingué 22x140	BDFZ22140	\N	\N	cold	22x140
6936	Boulon Demi Filetage Zingué à chaud 22x140	BDFZC22140	\N	\N	hot	22x140
6937	Boulon Demi Filetage Acier 22x140	BDFA22140	\N	\N	acier	22x140
6938	Boulon Demi Filetage Brut 22x150	BDFB22150	\N	\N	none	22x150
6939	Boulon Demi Filetage Zingué 22x150	BDFZ22150	\N	\N	cold	22x150
6940	Boulon Demi Filetage Zingué à chaud 22x150	BDFZC22150	\N	\N	hot	22x150
6941	Boulon Demi Filetage Acier 22x150	BDFA22150	\N	\N	acier	22x150
6942	Boulon Demi Filetage Brut 22x160	BDFB22160	\N	\N	none	22x160
6943	Boulon Demi Filetage Zingué 22x160	BDFZ22160	\N	\N	cold	22x160
6944	Boulon Demi Filetage Zingué à chaud 22x160	BDFZC22160	\N	\N	hot	22x160
6945	Boulon Demi Filetage Acier 22x160	BDFA22160	\N	\N	acier	22x160
6946	Boulon Demi Filetage Brut 22x170	BDFB22170	\N	\N	none	22x170
6947	Boulon Demi Filetage Zingué 22x170	BDFZ22170	\N	\N	cold	22x170
6948	Boulon Demi Filetage Zingué à chaud 22x170	BDFZC22170	\N	\N	hot	22x170
6949	Boulon Demi Filetage Acier 22x170	BDFA22170	\N	\N	acier	22x170
6950	Boulon Demi Filetage Brut 22x180	BDFB22180	\N	\N	none	22x180
6951	Boulon Demi Filetage Zingué 22x180	BDFZ22180	\N	\N	cold	22x180
6952	Boulon Demi Filetage Zingué à chaud 22x180	BDFZC22180	\N	\N	hot	22x180
6953	Boulon Demi Filetage Acier 22x180	BDFA22180	\N	\N	acier	22x180
6954	Boulon Demi Filetage Brut 22x190	BDFB22190	\N	\N	none	22x190
6955	Boulon Demi Filetage Zingué 22x190	BDFZ22190	\N	\N	cold	22x190
6956	Boulon Demi Filetage Zingué à chaud 22x190	BDFZC22190	\N	\N	hot	22x190
6957	Boulon Demi Filetage Acier 22x190	BDFA22190	\N	\N	acier	22x190
6958	Boulon Demi Filetage Brut 22x200	BDFB22200	\N	\N	none	22x200
6959	Boulon Demi Filetage Zingué 22x200	BDFZ22200	\N	\N	cold	22x200
6960	Boulon Demi Filetage Zingué à chaud 22x200	BDFZC22200	\N	\N	hot	22x200
6961	Boulon Demi Filetage Acier 22x200	BDFA22200	\N	\N	acier	22x200
6962	Boulon Demi Filetage Brut 24x12	BDFB2412	\N	\N	none	24x12
6963	Boulon Demi Filetage Zingué 24x12	BDFZ2412	\N	\N	cold	24x12
6964	Boulon Demi Filetage Zingué à chaud 24x12	BDFZC2412	\N	\N	hot	24x12
6965	Boulon Demi Filetage Acier 24x12	BDFA2412	\N	\N	acier	24x12
6966	Boulon Demi Filetage Brut 24x16	BDFB2416	\N	\N	none	24x16
6967	Boulon Demi Filetage Zingué 24x16	BDFZ2416	\N	\N	cold	24x16
6968	Boulon Demi Filetage Zingué à chaud 24x16	BDFZC2416	\N	\N	hot	24x16
6969	Boulon Demi Filetage Acier 24x16	BDFA2416	\N	\N	acier	24x16
6970	Boulon Demi Filetage Brut 24x20	BDFB2420	\N	\N	none	24x20
6971	Boulon Demi Filetage Zingué 24x20	BDFZ2420	\N	\N	cold	24x20
6972	Boulon Demi Filetage Zingué à chaud 24x20	BDFZC2420	\N	\N	hot	24x20
6973	Boulon Demi Filetage Acier 24x20	BDFA2420	\N	\N	acier	24x20
6974	Boulon Demi Filetage Brut 24x25	BDFB2425	\N	\N	none	24x25
6975	Boulon Demi Filetage Zingué 24x25	BDFZ2425	\N	\N	cold	24x25
6976	Boulon Demi Filetage Zingué à chaud 24x25	BDFZC2425	\N	\N	hot	24x25
6977	Boulon Demi Filetage Acier 24x25	BDFA2425	\N	\N	acier	24x25
6978	Boulon Demi Filetage Brut 24x30	BDFB2430	\N	\N	none	24x30
6979	Boulon Demi Filetage Zingué 24x30	BDFZ2430	\N	\N	cold	24x30
6980	Boulon Demi Filetage Zingué à chaud 24x30	BDFZC2430	\N	\N	hot	24x30
6981	Boulon Demi Filetage Acier 24x30	BDFA2430	\N	\N	acier	24x30
6982	Boulon Demi Filetage Brut 24x35	BDFB2435	\N	\N	none	24x35
6983	Boulon Demi Filetage Zingué 24x35	BDFZ2435	\N	\N	cold	24x35
6984	Boulon Demi Filetage Zingué à chaud 24x35	BDFZC2435	\N	\N	hot	24x35
6985	Boulon Demi Filetage Acier 24x35	BDFA2435	\N	\N	acier	24x35
6986	Boulon Demi Filetage Brut 24x40	BDFB2440	\N	\N	none	24x40
6987	Boulon Demi Filetage Zingué 24x40	BDFZ2440	\N	\N	cold	24x40
6988	Boulon Demi Filetage Zingué à chaud 24x40	BDFZC2440	\N	\N	hot	24x40
6989	Boulon Demi Filetage Acier 24x40	BDFA2440	\N	\N	acier	24x40
6990	Boulon Demi Filetage Brut 24x45	BDFB2445	\N	\N	none	24x45
6991	Boulon Demi Filetage Zingué 24x45	BDFZ2445	\N	\N	cold	24x45
6992	Boulon Demi Filetage Zingué à chaud 24x45	BDFZC2445	\N	\N	hot	24x45
6993	Boulon Demi Filetage Acier 24x45	BDFA2445	\N	\N	acier	24x45
6994	Boulon Demi Filetage Brut 24x50	BDFB2450	\N	\N	none	24x50
6995	Boulon Demi Filetage Zingué 24x50	BDFZ2450	\N	\N	cold	24x50
6996	Boulon Demi Filetage Zingué à chaud 24x50	BDFZC2450	\N	\N	hot	24x50
6997	Boulon Demi Filetage Acier 24x50	BDFA2450	\N	\N	acier	24x50
6998	Boulon Demi Filetage Brut 24x55	BDFB2455	\N	\N	none	24x55
6999	Boulon Demi Filetage Zingué 24x55	BDFZ2455	\N	\N	cold	24x55
7000	Boulon Demi Filetage Zingué à chaud 24x55	BDFZC2455	\N	\N	hot	24x55
7001	Boulon Demi Filetage Acier 24x55	BDFA2455	\N	\N	acier	24x55
7002	Boulon Demi Filetage Brut 24x60	BDFB2460	\N	\N	none	24x60
7003	Boulon Demi Filetage Zingué 24x60	BDFZ2460	\N	\N	cold	24x60
7004	Boulon Demi Filetage Zingué à chaud 24x60	BDFZC2460	\N	\N	hot	24x60
7005	Boulon Demi Filetage Acier 24x60	BDFA2460	\N	\N	acier	24x60
7006	Boulon Demi Filetage Brut 24x65	BDFB2465	\N	\N	none	24x65
7007	Boulon Demi Filetage Zingué 24x65	BDFZ2465	\N	\N	cold	24x65
7008	Boulon Demi Filetage Zingué à chaud 24x65	BDFZC2465	\N	\N	hot	24x65
7009	Boulon Demi Filetage Acier 24x65	BDFA2465	\N	\N	acier	24x65
7010	Boulon Demi Filetage Brut 24x70	BDFB2470	\N	\N	none	24x70
7011	Boulon Demi Filetage Zingué 24x70	BDFZ2470	\N	\N	cold	24x70
7012	Boulon Demi Filetage Zingué à chaud 24x70	BDFZC2470	\N	\N	hot	24x70
7013	Boulon Demi Filetage Acier 24x70	BDFA2470	\N	\N	acier	24x70
7014	Boulon Demi Filetage Brut 24x75	BDFB2475	\N	\N	none	24x75
7015	Boulon Demi Filetage Zingué 24x75	BDFZ2475	\N	\N	cold	24x75
7016	Boulon Demi Filetage Zingué à chaud 24x75	BDFZC2475	\N	\N	hot	24x75
7017	Boulon Demi Filetage Acier 24x75	BDFA2475	\N	\N	acier	24x75
7018	Boulon Demi Filetage Brut 24x80	BDFB2480	\N	\N	none	24x80
7019	Boulon Demi Filetage Zingué 24x80	BDFZ2480	\N	\N	cold	24x80
7020	Boulon Demi Filetage Zingué à chaud 24x80	BDFZC2480	\N	\N	hot	24x80
7021	Boulon Demi Filetage Acier 24x80	BDFA2480	\N	\N	acier	24x80
7022	Boulon Demi Filetage Brut 24x85	BDFB2485	\N	\N	none	24x85
7023	Boulon Demi Filetage Zingué 24x85	BDFZ2485	\N	\N	cold	24x85
7024	Boulon Demi Filetage Zingué à chaud 24x85	BDFZC2485	\N	\N	hot	24x85
7025	Boulon Demi Filetage Acier 24x85	BDFA2485	\N	\N	acier	24x85
7026	Boulon Demi Filetage Brut 24x90	BDFB2490	\N	\N	none	24x90
7027	Boulon Demi Filetage Zingué 24x90	BDFZ2490	\N	\N	cold	24x90
7028	Boulon Demi Filetage Zingué à chaud 24x90	BDFZC2490	\N	\N	hot	24x90
7029	Boulon Demi Filetage Acier 24x90	BDFA2490	\N	\N	acier	24x90
7030	Boulon Demi Filetage Brut 24x100	BDFB24100	\N	\N	none	24x100
7031	Boulon Demi Filetage Zingué 24x100	BDFZ24100	\N	\N	cold	24x100
7032	Boulon Demi Filetage Zingué à chaud 24x100	BDFZC24100	\N	\N	hot	24x100
7033	Boulon Demi Filetage Acier 24x100	BDFA24100	\N	\N	acier	24x100
7034	Boulon Demi Filetage Brut 24x110	BDFB24110	\N	\N	none	24x110
7035	Boulon Demi Filetage Zingué 24x110	BDFZ24110	\N	\N	cold	24x110
7036	Boulon Demi Filetage Zingué à chaud 24x110	BDFZC24110	\N	\N	hot	24x110
7037	Boulon Demi Filetage Acier 24x110	BDFA24110	\N	\N	acier	24x110
7038	Boulon Demi Filetage Brut 24x120	BDFB24120	\N	\N	none	24x120
7039	Boulon Demi Filetage Zingué 24x120	BDFZ24120	\N	\N	cold	24x120
7040	Boulon Demi Filetage Zingué à chaud 24x120	BDFZC24120	\N	\N	hot	24x120
7041	Boulon Demi Filetage Acier 24x120	BDFA24120	\N	\N	acier	24x120
7042	Boulon Demi Filetage Brut 24x130	BDFB24130	\N	\N	none	24x130
7043	Boulon Demi Filetage Zingué 24x130	BDFZ24130	\N	\N	cold	24x130
7044	Boulon Demi Filetage Zingué à chaud 24x130	BDFZC24130	\N	\N	hot	24x130
7045	Boulon Demi Filetage Acier 24x130	BDFA24130	\N	\N	acier	24x130
7046	Boulon Demi Filetage Brut 24x140	BDFB24140	\N	\N	none	24x140
7047	Boulon Demi Filetage Zingué 24x140	BDFZ24140	\N	\N	cold	24x140
7048	Boulon Demi Filetage Zingué à chaud 24x140	BDFZC24140	\N	\N	hot	24x140
7049	Boulon Demi Filetage Acier 24x140	BDFA24140	\N	\N	acier	24x140
7050	Boulon Demi Filetage Brut 24x150	BDFB24150	\N	\N	none	24x150
7051	Boulon Demi Filetage Zingué 24x150	BDFZ24150	\N	\N	cold	24x150
7052	Boulon Demi Filetage Zingué à chaud 24x150	BDFZC24150	\N	\N	hot	24x150
7053	Boulon Demi Filetage Acier 24x150	BDFA24150	\N	\N	acier	24x150
7054	Boulon Demi Filetage Brut 24x160	BDFB24160	\N	\N	none	24x160
7055	Boulon Demi Filetage Zingué 24x160	BDFZ24160	\N	\N	cold	24x160
7056	Boulon Demi Filetage Zingué à chaud 24x160	BDFZC24160	\N	\N	hot	24x160
7057	Boulon Demi Filetage Acier 24x160	BDFA24160	\N	\N	acier	24x160
7058	Boulon Demi Filetage Brut 24x170	BDFB24170	\N	\N	none	24x170
7059	Boulon Demi Filetage Zingué 24x170	BDFZ24170	\N	\N	cold	24x170
7060	Boulon Demi Filetage Zingué à chaud 24x170	BDFZC24170	\N	\N	hot	24x170
7061	Boulon Demi Filetage Acier 24x170	BDFA24170	\N	\N	acier	24x170
7062	Boulon Demi Filetage Brut 24x180	BDFB24180	\N	\N	none	24x180
7063	Boulon Demi Filetage Zingué 24x180	BDFZ24180	\N	\N	cold	24x180
7064	Boulon Demi Filetage Zingué à chaud 24x180	BDFZC24180	\N	\N	hot	24x180
7065	Boulon Demi Filetage Acier 24x180	BDFA24180	\N	\N	acier	24x180
7066	Boulon Demi Filetage Brut 24x190	BDFB24190	\N	\N	none	24x190
7067	Boulon Demi Filetage Zingué 24x190	BDFZ24190	\N	\N	cold	24x190
7068	Boulon Demi Filetage Zingué à chaud 24x190	BDFZC24190	\N	\N	hot	24x190
7069	Boulon Demi Filetage Acier 24x190	BDFA24190	\N	\N	acier	24x190
7070	Boulon Demi Filetage Brut 24x200	BDFB24200	\N	\N	none	24x200
7071	Boulon Demi Filetage Zingué 24x200	BDFZ24200	\N	\N	cold	24x200
7072	Boulon Demi Filetage Zingué à chaud 24x200	BDFZC24200	\N	\N	hot	24x200
7073	Boulon Demi Filetage Acier 24x200	BDFA24200	\N	\N	acier	24x200
7074	Boulon Demi Filetage Brut 27x12	BDFB2712	\N	\N	none	27x12
7075	Boulon Demi Filetage Zingué 27x12	BDFZ2712	\N	\N	cold	27x12
7076	Boulon Demi Filetage Zingué à chaud 27x12	BDFZC2712	\N	\N	hot	27x12
7077	Boulon Demi Filetage Acier 27x12	BDFA2712	\N	\N	acier	27x12
7078	Boulon Demi Filetage Brut 27x16	BDFB2716	\N	\N	none	27x16
7079	Boulon Demi Filetage Zingué 27x16	BDFZ2716	\N	\N	cold	27x16
7080	Boulon Demi Filetage Zingué à chaud 27x16	BDFZC2716	\N	\N	hot	27x16
7081	Boulon Demi Filetage Acier 27x16	BDFA2716	\N	\N	acier	27x16
7082	Boulon Demi Filetage Brut 27x20	BDFB2720	\N	\N	none	27x20
7083	Boulon Demi Filetage Zingué 27x20	BDFZ2720	\N	\N	cold	27x20
7084	Boulon Demi Filetage Zingué à chaud 27x20	BDFZC2720	\N	\N	hot	27x20
7085	Boulon Demi Filetage Acier 27x20	BDFA2720	\N	\N	acier	27x20
7086	Boulon Demi Filetage Brut 27x25	BDFB2725	\N	\N	none	27x25
7087	Boulon Demi Filetage Zingué 27x25	BDFZ2725	\N	\N	cold	27x25
7088	Boulon Demi Filetage Zingué à chaud 27x25	BDFZC2725	\N	\N	hot	27x25
7089	Boulon Demi Filetage Acier 27x25	BDFA2725	\N	\N	acier	27x25
7090	Boulon Demi Filetage Brut 27x30	BDFB2730	\N	\N	none	27x30
7091	Boulon Demi Filetage Zingué 27x30	BDFZ2730	\N	\N	cold	27x30
7092	Boulon Demi Filetage Zingué à chaud 27x30	BDFZC2730	\N	\N	hot	27x30
7093	Boulon Demi Filetage Acier 27x30	BDFA2730	\N	\N	acier	27x30
7094	Boulon Demi Filetage Brut 27x35	BDFB2735	\N	\N	none	27x35
7095	Boulon Demi Filetage Zingué 27x35	BDFZ2735	\N	\N	cold	27x35
7096	Boulon Demi Filetage Zingué à chaud 27x35	BDFZC2735	\N	\N	hot	27x35
7097	Boulon Demi Filetage Acier 27x35	BDFA2735	\N	\N	acier	27x35
7098	Boulon Demi Filetage Brut 27x40	BDFB2740	\N	\N	none	27x40
7099	Boulon Demi Filetage Zingué 27x40	BDFZ2740	\N	\N	cold	27x40
7100	Boulon Demi Filetage Zingué à chaud 27x40	BDFZC2740	\N	\N	hot	27x40
7101	Boulon Demi Filetage Acier 27x40	BDFA2740	\N	\N	acier	27x40
7102	Boulon Demi Filetage Brut 27x45	BDFB2745	\N	\N	none	27x45
7103	Boulon Demi Filetage Zingué 27x45	BDFZ2745	\N	\N	cold	27x45
7104	Boulon Demi Filetage Zingué à chaud 27x45	BDFZC2745	\N	\N	hot	27x45
7105	Boulon Demi Filetage Acier 27x45	BDFA2745	\N	\N	acier	27x45
7106	Boulon Demi Filetage Brut 27x50	BDFB2750	\N	\N	none	27x50
7107	Boulon Demi Filetage Zingué 27x50	BDFZ2750	\N	\N	cold	27x50
7108	Boulon Demi Filetage Zingué à chaud 27x50	BDFZC2750	\N	\N	hot	27x50
7109	Boulon Demi Filetage Acier 27x50	BDFA2750	\N	\N	acier	27x50
7110	Boulon Demi Filetage Brut 27x55	BDFB2755	\N	\N	none	27x55
7111	Boulon Demi Filetage Zingué 27x55	BDFZ2755	\N	\N	cold	27x55
7112	Boulon Demi Filetage Zingué à chaud 27x55	BDFZC2755	\N	\N	hot	27x55
7113	Boulon Demi Filetage Acier 27x55	BDFA2755	\N	\N	acier	27x55
7114	Boulon Demi Filetage Brut 27x60	BDFB2760	\N	\N	none	27x60
7115	Boulon Demi Filetage Zingué 27x60	BDFZ2760	\N	\N	cold	27x60
7116	Boulon Demi Filetage Zingué à chaud 27x60	BDFZC2760	\N	\N	hot	27x60
7117	Boulon Demi Filetage Acier 27x60	BDFA2760	\N	\N	acier	27x60
7118	Boulon Demi Filetage Brut 27x65	BDFB2765	\N	\N	none	27x65
7119	Boulon Demi Filetage Zingué 27x65	BDFZ2765	\N	\N	cold	27x65
7120	Boulon Demi Filetage Zingué à chaud 27x65	BDFZC2765	\N	\N	hot	27x65
7121	Boulon Demi Filetage Acier 27x65	BDFA2765	\N	\N	acier	27x65
7122	Boulon Demi Filetage Brut 27x70	BDFB2770	\N	\N	none	27x70
7123	Boulon Demi Filetage Zingué 27x70	BDFZ2770	\N	\N	cold	27x70
7124	Boulon Demi Filetage Zingué à chaud 27x70	BDFZC2770	\N	\N	hot	27x70
7125	Boulon Demi Filetage Acier 27x70	BDFA2770	\N	\N	acier	27x70
7126	Boulon Demi Filetage Brut 27x75	BDFB2775	\N	\N	none	27x75
7127	Boulon Demi Filetage Zingué 27x75	BDFZ2775	\N	\N	cold	27x75
7128	Boulon Demi Filetage Zingué à chaud 27x75	BDFZC2775	\N	\N	hot	27x75
7129	Boulon Demi Filetage Acier 27x75	BDFA2775	\N	\N	acier	27x75
7130	Boulon Demi Filetage Brut 27x80	BDFB2780	\N	\N	none	27x80
7131	Boulon Demi Filetage Zingué 27x80	BDFZ2780	\N	\N	cold	27x80
7132	Boulon Demi Filetage Zingué à chaud 27x80	BDFZC2780	\N	\N	hot	27x80
7133	Boulon Demi Filetage Acier 27x80	BDFA2780	\N	\N	acier	27x80
7134	Boulon Demi Filetage Brut 27x85	BDFB2785	\N	\N	none	27x85
7135	Boulon Demi Filetage Zingué 27x85	BDFZ2785	\N	\N	cold	27x85
7136	Boulon Demi Filetage Zingué à chaud 27x85	BDFZC2785	\N	\N	hot	27x85
7137	Boulon Demi Filetage Acier 27x85	BDFA2785	\N	\N	acier	27x85
7138	Boulon Demi Filetage Brut 27x90	BDFB2790	\N	\N	none	27x90
7139	Boulon Demi Filetage Zingué 27x90	BDFZ2790	\N	\N	cold	27x90
7140	Boulon Demi Filetage Zingué à chaud 27x90	BDFZC2790	\N	\N	hot	27x90
7141	Boulon Demi Filetage Acier 27x90	BDFA2790	\N	\N	acier	27x90
7142	Boulon Demi Filetage Brut 27x100	BDFB27100	\N	\N	none	27x100
7143	Boulon Demi Filetage Zingué 27x100	BDFZ27100	\N	\N	cold	27x100
7144	Boulon Demi Filetage Zingué à chaud 27x100	BDFZC27100	\N	\N	hot	27x100
7145	Boulon Demi Filetage Acier 27x100	BDFA27100	\N	\N	acier	27x100
7146	Boulon Demi Filetage Brut 27x110	BDFB27110	\N	\N	none	27x110
7147	Boulon Demi Filetage Zingué 27x110	BDFZ27110	\N	\N	cold	27x110
7148	Boulon Demi Filetage Zingué à chaud 27x110	BDFZC27110	\N	\N	hot	27x110
7149	Boulon Demi Filetage Acier 27x110	BDFA27110	\N	\N	acier	27x110
7150	Boulon Demi Filetage Brut 27x120	BDFB27120	\N	\N	none	27x120
7151	Boulon Demi Filetage Zingué 27x120	BDFZ27120	\N	\N	cold	27x120
7152	Boulon Demi Filetage Zingué à chaud 27x120	BDFZC27120	\N	\N	hot	27x120
7153	Boulon Demi Filetage Acier 27x120	BDFA27120	\N	\N	acier	27x120
7154	Boulon Demi Filetage Brut 27x130	BDFB27130	\N	\N	none	27x130
7155	Boulon Demi Filetage Zingué 27x130	BDFZ27130	\N	\N	cold	27x130
7156	Boulon Demi Filetage Zingué à chaud 27x130	BDFZC27130	\N	\N	hot	27x130
7157	Boulon Demi Filetage Acier 27x130	BDFA27130	\N	\N	acier	27x130
7158	Boulon Demi Filetage Brut 27x140	BDFB27140	\N	\N	none	27x140
7159	Boulon Demi Filetage Zingué 27x140	BDFZ27140	\N	\N	cold	27x140
7160	Boulon Demi Filetage Zingué à chaud 27x140	BDFZC27140	\N	\N	hot	27x140
7161	Boulon Demi Filetage Acier 27x140	BDFA27140	\N	\N	acier	27x140
7162	Boulon Demi Filetage Brut 27x150	BDFB27150	\N	\N	none	27x150
7163	Boulon Demi Filetage Zingué 27x150	BDFZ27150	\N	\N	cold	27x150
7164	Boulon Demi Filetage Zingué à chaud 27x150	BDFZC27150	\N	\N	hot	27x150
7165	Boulon Demi Filetage Acier 27x150	BDFA27150	\N	\N	acier	27x150
7166	Boulon Demi Filetage Brut 27x160	BDFB27160	\N	\N	none	27x160
7167	Boulon Demi Filetage Zingué 27x160	BDFZ27160	\N	\N	cold	27x160
7168	Boulon Demi Filetage Zingué à chaud 27x160	BDFZC27160	\N	\N	hot	27x160
7169	Boulon Demi Filetage Acier 27x160	BDFA27160	\N	\N	acier	27x160
7170	Boulon Demi Filetage Brut 27x170	BDFB27170	\N	\N	none	27x170
7171	Boulon Demi Filetage Zingué 27x170	BDFZ27170	\N	\N	cold	27x170
7172	Boulon Demi Filetage Zingué à chaud 27x170	BDFZC27170	\N	\N	hot	27x170
7173	Boulon Demi Filetage Acier 27x170	BDFA27170	\N	\N	acier	27x170
7174	Boulon Demi Filetage Brut 27x180	BDFB27180	\N	\N	none	27x180
7175	Boulon Demi Filetage Zingué 27x180	BDFZ27180	\N	\N	cold	27x180
7176	Boulon Demi Filetage Zingué à chaud 27x180	BDFZC27180	\N	\N	hot	27x180
7177	Boulon Demi Filetage Acier 27x180	BDFA27180	\N	\N	acier	27x180
7178	Boulon Demi Filetage Brut 27x190	BDFB27190	\N	\N	none	27x190
7179	Boulon Demi Filetage Zingué 27x190	BDFZ27190	\N	\N	cold	27x190
7180	Boulon Demi Filetage Zingué à chaud 27x190	BDFZC27190	\N	\N	hot	27x190
7181	Boulon Demi Filetage Acier 27x190	BDFA27190	\N	\N	acier	27x190
7182	Boulon Demi Filetage Brut 27x200	BDFB27200	\N	\N	none	27x200
7183	Boulon Demi Filetage Zingué 27x200	BDFZ27200	\N	\N	cold	27x200
7184	Boulon Demi Filetage Zingué à chaud 27x200	BDFZC27200	\N	\N	hot	27x200
7185	Boulon Demi Filetage Acier 27x200	BDFA27200	\N	\N	acier	27x200
7186	Boulon Demi Filetage Brut 30x12	BDFB3012	\N	\N	none	30x12
7187	Boulon Demi Filetage Zingué 30x12	BDFZ3012	\N	\N	cold	30x12
7188	Boulon Demi Filetage Zingué à chaud 30x12	BDFZC3012	\N	\N	hot	30x12
7189	Boulon Demi Filetage Acier 30x12	BDFA3012	\N	\N	acier	30x12
7190	Boulon Demi Filetage Brut 30x16	BDFB3016	\N	\N	none	30x16
7191	Boulon Demi Filetage Zingué 30x16	BDFZ3016	\N	\N	cold	30x16
7192	Boulon Demi Filetage Zingué à chaud 30x16	BDFZC3016	\N	\N	hot	30x16
7193	Boulon Demi Filetage Acier 30x16	BDFA3016	\N	\N	acier	30x16
7194	Boulon Demi Filetage Brut 30x20	BDFB3020	\N	\N	none	30x20
7195	Boulon Demi Filetage Zingué 30x20	BDFZ3020	\N	\N	cold	30x20
7196	Boulon Demi Filetage Zingué à chaud 30x20	BDFZC3020	\N	\N	hot	30x20
7197	Boulon Demi Filetage Acier 30x20	BDFA3020	\N	\N	acier	30x20
7198	Boulon Demi Filetage Brut 30x25	BDFB3025	\N	\N	none	30x25
7199	Boulon Demi Filetage Zingué 30x25	BDFZ3025	\N	\N	cold	30x25
7200	Boulon Demi Filetage Zingué à chaud 30x25	BDFZC3025	\N	\N	hot	30x25
7201	Boulon Demi Filetage Acier 30x25	BDFA3025	\N	\N	acier	30x25
7202	Boulon Demi Filetage Brut 30x30	BDFB3030	\N	\N	none	30x30
7203	Boulon Demi Filetage Zingué 30x30	BDFZ3030	\N	\N	cold	30x30
7204	Boulon Demi Filetage Zingué à chaud 30x30	BDFZC3030	\N	\N	hot	30x30
7205	Boulon Demi Filetage Acier 30x30	BDFA3030	\N	\N	acier	30x30
7206	Boulon Demi Filetage Brut 30x35	BDFB3035	\N	\N	none	30x35
7207	Boulon Demi Filetage Zingué 30x35	BDFZ3035	\N	\N	cold	30x35
7208	Boulon Demi Filetage Zingué à chaud 30x35	BDFZC3035	\N	\N	hot	30x35
7209	Boulon Demi Filetage Acier 30x35	BDFA3035	\N	\N	acier	30x35
7210	Boulon Demi Filetage Brut 30x40	BDFB3040	\N	\N	none	30x40
7211	Boulon Demi Filetage Zingué 30x40	BDFZ3040	\N	\N	cold	30x40
7212	Boulon Demi Filetage Zingué à chaud 30x40	BDFZC3040	\N	\N	hot	30x40
7213	Boulon Demi Filetage Acier 30x40	BDFA3040	\N	\N	acier	30x40
7214	Boulon Demi Filetage Brut 30x45	BDFB3045	\N	\N	none	30x45
7215	Boulon Demi Filetage Zingué 30x45	BDFZ3045	\N	\N	cold	30x45
7216	Boulon Demi Filetage Zingué à chaud 30x45	BDFZC3045	\N	\N	hot	30x45
7217	Boulon Demi Filetage Acier 30x45	BDFA3045	\N	\N	acier	30x45
7218	Boulon Demi Filetage Brut 30x50	BDFB3050	\N	\N	none	30x50
7219	Boulon Demi Filetage Zingué 30x50	BDFZ3050	\N	\N	cold	30x50
7220	Boulon Demi Filetage Zingué à chaud 30x50	BDFZC3050	\N	\N	hot	30x50
7221	Boulon Demi Filetage Acier 30x50	BDFA3050	\N	\N	acier	30x50
7222	Boulon Demi Filetage Brut 30x55	BDFB3055	\N	\N	none	30x55
7223	Boulon Demi Filetage Zingué 30x55	BDFZ3055	\N	\N	cold	30x55
7224	Boulon Demi Filetage Zingué à chaud 30x55	BDFZC3055	\N	\N	hot	30x55
7225	Boulon Demi Filetage Acier 30x55	BDFA3055	\N	\N	acier	30x55
7226	Boulon Demi Filetage Brut 30x60	BDFB3060	\N	\N	none	30x60
7227	Boulon Demi Filetage Zingué 30x60	BDFZ3060	\N	\N	cold	30x60
7228	Boulon Demi Filetage Zingué à chaud 30x60	BDFZC3060	\N	\N	hot	30x60
7229	Boulon Demi Filetage Acier 30x60	BDFA3060	\N	\N	acier	30x60
7230	Boulon Demi Filetage Brut 30x65	BDFB3065	\N	\N	none	30x65
7231	Boulon Demi Filetage Zingué 30x65	BDFZ3065	\N	\N	cold	30x65
7232	Boulon Demi Filetage Zingué à chaud 30x65	BDFZC3065	\N	\N	hot	30x65
7233	Boulon Demi Filetage Acier 30x65	BDFA3065	\N	\N	acier	30x65
7234	Boulon Demi Filetage Brut 30x70	BDFB3070	\N	\N	none	30x70
7235	Boulon Demi Filetage Zingué 30x70	BDFZ3070	\N	\N	cold	30x70
7236	Boulon Demi Filetage Zingué à chaud 30x70	BDFZC3070	\N	\N	hot	30x70
7237	Boulon Demi Filetage Acier 30x70	BDFA3070	\N	\N	acier	30x70
7238	Boulon Demi Filetage Brut 30x75	BDFB3075	\N	\N	none	30x75
7239	Boulon Demi Filetage Zingué 30x75	BDFZ3075	\N	\N	cold	30x75
7240	Boulon Demi Filetage Zingué à chaud 30x75	BDFZC3075	\N	\N	hot	30x75
7241	Boulon Demi Filetage Acier 30x75	BDFA3075	\N	\N	acier	30x75
7242	Boulon Demi Filetage Brut 30x80	BDFB3080	\N	\N	none	30x80
7243	Boulon Demi Filetage Zingué 30x80	BDFZ3080	\N	\N	cold	30x80
7244	Boulon Demi Filetage Zingué à chaud 30x80	BDFZC3080	\N	\N	hot	30x80
7245	Boulon Demi Filetage Acier 30x80	BDFA3080	\N	\N	acier	30x80
7246	Boulon Demi Filetage Brut 30x85	BDFB3085	\N	\N	none	30x85
7247	Boulon Demi Filetage Zingué 30x85	BDFZ3085	\N	\N	cold	30x85
7248	Boulon Demi Filetage Zingué à chaud 30x85	BDFZC3085	\N	\N	hot	30x85
7249	Boulon Demi Filetage Acier 30x85	BDFA3085	\N	\N	acier	30x85
7250	Boulon Demi Filetage Brut 30x90	BDFB3090	\N	\N	none	30x90
7251	Boulon Demi Filetage Zingué 30x90	BDFZ3090	\N	\N	cold	30x90
7252	Boulon Demi Filetage Zingué à chaud 30x90	BDFZC3090	\N	\N	hot	30x90
7253	Boulon Demi Filetage Acier 30x90	BDFA3090	\N	\N	acier	30x90
7254	Boulon Demi Filetage Brut 30x100	BDFB30100	\N	\N	none	30x100
7255	Boulon Demi Filetage Zingué 30x100	BDFZ30100	\N	\N	cold	30x100
7256	Boulon Demi Filetage Zingué à chaud 30x100	BDFZC30100	\N	\N	hot	30x100
7257	Boulon Demi Filetage Acier 30x100	BDFA30100	\N	\N	acier	30x100
7258	Boulon Demi Filetage Brut 30x110	BDFB30110	\N	\N	none	30x110
7259	Boulon Demi Filetage Zingué 30x110	BDFZ30110	\N	\N	cold	30x110
7260	Boulon Demi Filetage Zingué à chaud 30x110	BDFZC30110	\N	\N	hot	30x110
7261	Boulon Demi Filetage Acier 30x110	BDFA30110	\N	\N	acier	30x110
7262	Boulon Demi Filetage Brut 30x120	BDFB30120	\N	\N	none	30x120
7263	Boulon Demi Filetage Zingué 30x120	BDFZ30120	\N	\N	cold	30x120
7264	Boulon Demi Filetage Zingué à chaud 30x120	BDFZC30120	\N	\N	hot	30x120
7265	Boulon Demi Filetage Acier 30x120	BDFA30120	\N	\N	acier	30x120
7266	Boulon Demi Filetage Brut 30x130	BDFB30130	\N	\N	none	30x130
7267	Boulon Demi Filetage Zingué 30x130	BDFZ30130	\N	\N	cold	30x130
7268	Boulon Demi Filetage Zingué à chaud 30x130	BDFZC30130	\N	\N	hot	30x130
7269	Boulon Demi Filetage Acier 30x130	BDFA30130	\N	\N	acier	30x130
7270	Boulon Demi Filetage Brut 30x140	BDFB30140	\N	\N	none	30x140
7271	Boulon Demi Filetage Zingué 30x140	BDFZ30140	\N	\N	cold	30x140
7272	Boulon Demi Filetage Zingué à chaud 30x140	BDFZC30140	\N	\N	hot	30x140
7273	Boulon Demi Filetage Acier 30x140	BDFA30140	\N	\N	acier	30x140
7274	Boulon Demi Filetage Brut 30x150	BDFB30150	\N	\N	none	30x150
7275	Boulon Demi Filetage Zingué 30x150	BDFZ30150	\N	\N	cold	30x150
7276	Boulon Demi Filetage Zingué à chaud 30x150	BDFZC30150	\N	\N	hot	30x150
7277	Boulon Demi Filetage Acier 30x150	BDFA30150	\N	\N	acier	30x150
7278	Boulon Demi Filetage Brut 30x160	BDFB30160	\N	\N	none	30x160
7279	Boulon Demi Filetage Zingué 30x160	BDFZ30160	\N	\N	cold	30x160
7280	Boulon Demi Filetage Zingué à chaud 30x160	BDFZC30160	\N	\N	hot	30x160
7281	Boulon Demi Filetage Acier 30x160	BDFA30160	\N	\N	acier	30x160
7282	Boulon Demi Filetage Brut 30x170	BDFB30170	\N	\N	none	30x170
7283	Boulon Demi Filetage Zingué 30x170	BDFZ30170	\N	\N	cold	30x170
7284	Boulon Demi Filetage Zingué à chaud 30x170	BDFZC30170	\N	\N	hot	30x170
7285	Boulon Demi Filetage Acier 30x170	BDFA30170	\N	\N	acier	30x170
7286	Boulon Demi Filetage Brut 30x180	BDFB30180	\N	\N	none	30x180
7287	Boulon Demi Filetage Zingué 30x180	BDFZ30180	\N	\N	cold	30x180
7288	Boulon Demi Filetage Zingué à chaud 30x180	BDFZC30180	\N	\N	hot	30x180
7289	Boulon Demi Filetage Acier 30x180	BDFA30180	\N	\N	acier	30x180
7290	Boulon Demi Filetage Brut 30x190	BDFB30190	\N	\N	none	30x190
7291	Boulon Demi Filetage Zingué 30x190	BDFZ30190	\N	\N	cold	30x190
7292	Boulon Demi Filetage Zingué à chaud 30x190	BDFZC30190	\N	\N	hot	30x190
7293	Boulon Demi Filetage Acier 30x190	BDFA30190	\N	\N	acier	30x190
7294	Boulon Demi Filetage Brut 30x200	BDFB30200	\N	\N	none	30x200
7295	Boulon Demi Filetage Zingué 30x200	BDFZ30200	\N	\N	cold	30x200
7296	Boulon Demi Filetage Zingué à chaud 30x200	BDFZC30200	\N	\N	hot	30x200
7297	Boulon Demi Filetage Acier 30x200	BDFA30200	\N	\N	acier	30x200
7298	Tige Filetée Brut 6mm - 1m	TFB6	\N	\N	none	6mm - 1m
7299	Tige Filetée Zingué 6mm - 1m	TFZ6	\N	\N	cold	6mm - 1m
7300	Tige Filetée Zingué à chaud 6mm - 1m	TFZC6	\N	\N	hot	6mm - 1m
7301	Tige Filetée Acier 6mm - 1m	TFA6	\N	\N	acier	6mm - 1m
7302	Tige Filetée Brut 8mm - 1m	TFB8	\N	\N	none	8mm - 1m
7303	Tige Filetée Zingué 8mm - 1m	TFZ8	\N	\N	cold	8mm - 1m
7304	Tige Filetée Zingué à chaud 8mm - 1m	TFZC8	\N	\N	hot	8mm - 1m
7305	Tige Filetée Acier 8mm - 1m	TFA8	\N	\N	acier	8mm - 1m
7306	Tige Filetée Brut 10mm - 1m	TFB10	\N	\N	none	10mm - 1m
7307	Tige Filetée Zingué 10mm - 1m	TFZ10	\N	\N	cold	10mm - 1m
7308	Tige Filetée Zingué à chaud 10mm - 1m	TFZC10	\N	\N	hot	10mm - 1m
7309	Tige Filetée Acier 10mm - 1m	TFA10	\N	\N	acier	10mm - 1m
7310	Tige Filetée Brut 12mm - 1m	TFB12	\N	\N	none	12mm - 1m
7311	Tige Filetée Zingué 12mm - 1m	TFZ12	\N	\N	cold	12mm - 1m
7312	Tige Filetée Zingué à chaud 12mm - 1m	TFZC12	\N	\N	hot	12mm - 1m
7313	Tige Filetée Acier 12mm - 1m	TFA12	\N	\N	acier	12mm - 1m
7314	Tige Filetée Brut 14mm - 1m	TFB14	\N	\N	none	14mm - 1m
7315	Tige Filetée Zingué 14mm - 1m	TFZ14	\N	\N	cold	14mm - 1m
7316	Tige Filetée Zingué à chaud 14mm - 1m	TFZC14	\N	\N	hot	14mm - 1m
7317	Tige Filetée Acier 14mm - 1m	TFA14	\N	\N	acier	14mm - 1m
7318	Tige Filetée Brut 16mm - 1m	TFB16	\N	\N	none	16mm - 1m
7319	Tige Filetée Zingué 16mm - 1m	TFZ16	\N	\N	cold	16mm - 1m
7320	Tige Filetée Zingué à chaud 16mm - 1m	TFZC16	\N	\N	hot	16mm - 1m
7321	Tige Filetée Acier 16mm - 1m	TFA16	\N	\N	acier	16mm - 1m
7322	Tige Filetée Brut 18mm - 1m	TFB18	\N	\N	none	18mm - 1m
7323	Tige Filetée Zingué 18mm - 1m	TFZ18	\N	\N	cold	18mm - 1m
7324	Tige Filetée Zingué à chaud 18mm - 1m	TFZC18	\N	\N	hot	18mm - 1m
7325	Tige Filetée Acier 18mm - 1m	TFA18	\N	\N	acier	18mm - 1m
7326	Tige Filetée Brut 20mm - 1m	TFB20	\N	\N	none	20mm - 1m
7327	Tige Filetée Zingué 20mm - 1m	TFZ20	\N	\N	cold	20mm - 1m
7328	Tige Filetée Zingué à chaud 20mm - 1m	TFZC20	\N	\N	hot	20mm - 1m
7329	Tige Filetée Acier 20mm - 1m	TFA20	\N	\N	acier	20mm - 1m
7330	Tige Filetée Brut 22mm - 1m	TFB22	\N	\N	none	22mm - 1m
7331	Tige Filetée Zingué 22mm - 1m	TFZ22	\N	\N	cold	22mm - 1m
7332	Tige Filetée Zingué à chaud 22mm - 1m	TFZC22	\N	\N	hot	22mm - 1m
7333	Tige Filetée Acier 22mm - 1m	TFA22	\N	\N	acier	22mm - 1m
7334	Tige Filetée Brut 24mm - 1m	TFB24	\N	\N	none	24mm - 1m
7335	Tige Filetée Zingué 24mm - 1m	TFZ24	\N	\N	cold	24mm - 1m
7336	Tige Filetée Zingué à chaud 24mm - 1m	TFZC24	\N	\N	hot	24mm - 1m
7337	Tige Filetée Acier 24mm - 1m	TFA24	\N	\N	acier	24mm - 1m
7338	Tige Filetée Brut 27mm - 1m	TFB27	\N	\N	none	27mm - 1m
7339	Tige Filetée Zingué 27mm - 1m	TFZ27	\N	\N	cold	27mm - 1m
7340	Tige Filetée Zingué à chaud 27mm - 1m	TFZC27	\N	\N	hot	27mm - 1m
7341	Tige Filetée Acier 27mm - 1m	TFA27	\N	\N	acier	27mm - 1m
7342	Tige Filetée Brut 30mm - 1m	TFB30	\N	\N	none	30mm - 1m
7343	Tige Filetée Zingué 30mm - 1m	TFZ30	\N	\N	cold	30mm - 1m
7344	Tige Filetée Zingué à chaud 30mm - 1m	TFZC30	\N	\N	hot	30mm - 1m
7345	Tige Filetée Acier 30mm - 1m	TFA30	\N	\N	acier	30mm - 1m
7346	Ecrou Brut M6	EB6	\N	\N	none	M6
7347	Ecrou Zingué M6	EZ6	\N	\N	cold	M6
7348	Ecrou Zingué à chaud M6	EZC6	\N	\N	hot	M6
7349	Ecrou Acier M6	EA6	\N	\N	acier	M6
7350	Ecrou Brut M8	EB8	\N	\N	none	M8
7351	Ecrou Zingué M8	EZ8	\N	\N	cold	M8
7352	Ecrou Zingué à chaud M8	EZC8	\N	\N	hot	M8
7353	Ecrou Acier M8	EA8	\N	\N	acier	M8
7354	Ecrou Brut M10	EB10	\N	\N	none	M10
7355	Ecrou Zingué M10	EZ10	\N	\N	cold	M10
7356	Ecrou Zingué à chaud M10	EZC10	\N	\N	hot	M10
7357	Ecrou Acier M10	EA10	\N	\N	acier	M10
7358	Ecrou Brut M12	EB12	\N	\N	none	M12
7359	Ecrou Zingué M12	EZ12	\N	\N	cold	M12
7360	Ecrou Zingué à chaud M12	EZC12	\N	\N	hot	M12
7361	Ecrou Acier M12	EA12	\N	\N	acier	M12
7362	Ecrou Brut M14	EB14	\N	\N	none	M14
7363	Ecrou Zingué M14	EZ14	\N	\N	cold	M14
7364	Ecrou Zingué à chaud M14	EZC14	\N	\N	hot	M14
7365	Ecrou Acier M14	EA14	\N	\N	acier	M14
7366	Ecrou Brut M16	EB16	\N	\N	none	M16
7367	Ecrou Zingué M16	EZ16	\N	\N	cold	M16
7368	Ecrou Zingué à chaud M16	EZC16	\N	\N	hot	M16
7369	Ecrou Acier M16	EA16	\N	\N	acier	M16
7370	Ecrou Brut M18	EB18	\N	\N	none	M18
7371	Ecrou Zingué M18	EZ18	\N	\N	cold	M18
7372	Ecrou Zingué à chaud M18	EZC18	\N	\N	hot	M18
7373	Ecrou Acier M18	EA18	\N	\N	acier	M18
7374	Ecrou Brut M20	EB20	\N	\N	none	M20
7375	Ecrou Zingué M20	EZ20	\N	\N	cold	M20
7376	Ecrou Zingué à chaud M20	EZC20	\N	\N	hot	M20
7377	Ecrou Acier M20	EA20	\N	\N	acier	M20
7378	Ecrou Brut M22	EB22	\N	\N	none	M22
7379	Ecrou Zingué M22	EZ22	\N	\N	cold	M22
7380	Ecrou Zingué à chaud M22	EZC22	\N	\N	hot	M22
7381	Ecrou Acier M22	EA22	\N	\N	acier	M22
7382	Ecrou Brut M24	EB24	\N	\N	none	M24
7383	Ecrou Zingué M24	EZ24	\N	\N	cold	M24
7384	Ecrou Zingué à chaud M24	EZC24	\N	\N	hot	M24
7385	Ecrou Acier M24	EA24	\N	\N	acier	M24
7386	Ecrou Brut M27	EB27	\N	\N	none	M27
7387	Ecrou Zingué M27	EZ27	\N	\N	cold	M27
7388	Ecrou Zingué à chaud M27	EZC27	\N	\N	hot	M27
7389	Ecrou Acier M27	EA27	\N	\N	acier	M27
7390	Ecrou Brut M30	EB30	\N	\N	none	M30
7391	Ecrou Zingué M30	EZ30	\N	\N	cold	M30
7392	Ecrou Zingué à chaud M30	EZC30	\N	\N	hot	M30
7393	Ecrou Acier M30	EA30	\N	\N	acier	M30
7394	Ecrou Brut M36	EB36	\N	\N	none	M36
7395	Ecrou Zingué M36	EZ36	\N	\N	cold	M36
7396	Ecrou Zingué à chaud M36	EZC36	\N	\N	hot	M36
7397	Ecrou Acier M36	EA36	\N	\N	acier	M36
7398	Rivet Brut 12x12	RB1212	\N	\N	none	12x12
7399	Rivet Zingué 12x12	RZ1212	\N	\N	cold	12x12
7400	Rivet Zingué à chaud 12x12	RZC1212	\N	\N	hot	12x12
7401	Rivet Acier 12x12	RA1212	\N	\N	acier	12x12
7402	Rivet Brut 12x16	RB1216	\N	\N	none	12x16
7403	Rivet Zingué 12x16	RZ1216	\N	\N	cold	12x16
7404	Rivet Zingué à chaud 12x16	RZC1216	\N	\N	hot	12x16
7405	Rivet Acier 12x16	RA1216	\N	\N	acier	12x16
7406	Rivet Brut 12x20	RB1220	\N	\N	none	12x20
7407	Rivet Zingué 12x20	RZ1220	\N	\N	cold	12x20
7408	Rivet Zingué à chaud 12x20	RZC1220	\N	\N	hot	12x20
7409	Rivet Acier 12x20	RA1220	\N	\N	acier	12x20
7410	Rivet Brut 12x25	RB1225	\N	\N	none	12x25
7411	Rivet Zingué 12x25	RZ1225	\N	\N	cold	12x25
7412	Rivet Zingué à chaud 12x25	RZC1225	\N	\N	hot	12x25
7413	Rivet Acier 12x25	RA1225	\N	\N	acier	12x25
7414	Rivet Brut 12x30	RB1230	\N	\N	none	12x30
7415	Rivet Zingué 12x30	RZ1230	\N	\N	cold	12x30
7416	Rivet Zingué à chaud 12x30	RZC1230	\N	\N	hot	12x30
7417	Rivet Acier 12x30	RA1230	\N	\N	acier	12x30
7418	Rivet Brut 12x35	RB1235	\N	\N	none	12x35
7419	Rivet Zingué 12x35	RZ1235	\N	\N	cold	12x35
7420	Rivet Zingué à chaud 12x35	RZC1235	\N	\N	hot	12x35
7421	Rivet Acier 12x35	RA1235	\N	\N	acier	12x35
7422	Rivet Brut 12x40	RB1240	\N	\N	none	12x40
7423	Rivet Zingué 12x40	RZ1240	\N	\N	cold	12x40
7424	Rivet Zingué à chaud 12x40	RZC1240	\N	\N	hot	12x40
7425	Rivet Acier 12x40	RA1240	\N	\N	acier	12x40
7426	Rivet Brut 12x45	RB1245	\N	\N	none	12x45
7427	Rivet Zingué 12x45	RZ1245	\N	\N	cold	12x45
7428	Rivet Zingué à chaud 12x45	RZC1245	\N	\N	hot	12x45
7429	Rivet Acier 12x45	RA1245	\N	\N	acier	12x45
7430	Rivet Brut 12x50	RB1250	\N	\N	none	12x50
7431	Rivet Zingué 12x50	RZ1250	\N	\N	cold	12x50
7432	Rivet Zingué à chaud 12x50	RZC1250	\N	\N	hot	12x50
7433	Rivet Acier 12x50	RA1250	\N	\N	acier	12x50
7434	Rivet Brut 12x55	RB1255	\N	\N	none	12x55
7435	Rivet Zingué 12x55	RZ1255	\N	\N	cold	12x55
7436	Rivet Zingué à chaud 12x55	RZC1255	\N	\N	hot	12x55
7437	Rivet Acier 12x55	RA1255	\N	\N	acier	12x55
7438	Rivet Brut 12x60	RB1260	\N	\N	none	12x60
7439	Rivet Zingué 12x60	RZ1260	\N	\N	cold	12x60
7440	Rivet Zingué à chaud 12x60	RZC1260	\N	\N	hot	12x60
7441	Rivet Acier 12x60	RA1260	\N	\N	acier	12x60
7442	Rivet Brut 12x65	RB1265	\N	\N	none	12x65
7443	Rivet Zingué 12x65	RZ1265	\N	\N	cold	12x65
7444	Rivet Zingué à chaud 12x65	RZC1265	\N	\N	hot	12x65
7445	Rivet Acier 12x65	RA1265	\N	\N	acier	12x65
7446	Rivet Brut 12x70	RB1270	\N	\N	none	12x70
7447	Rivet Zingué 12x70	RZ1270	\N	\N	cold	12x70
7448	Rivet Zingué à chaud 12x70	RZC1270	\N	\N	hot	12x70
7449	Rivet Acier 12x70	RA1270	\N	\N	acier	12x70
7450	Rivet Brut 12x75	RB1275	\N	\N	none	12x75
7451	Rivet Zingué 12x75	RZ1275	\N	\N	cold	12x75
7452	Rivet Zingué à chaud 12x75	RZC1275	\N	\N	hot	12x75
7453	Rivet Acier 12x75	RA1275	\N	\N	acier	12x75
7454	Rivet Brut 12x80	RB1280	\N	\N	none	12x80
7455	Rivet Zingué 12x80	RZ1280	\N	\N	cold	12x80
7456	Rivet Zingué à chaud 12x80	RZC1280	\N	\N	hot	12x80
7457	Rivet Acier 12x80	RA1280	\N	\N	acier	12x80
7458	Rivet Brut 12x85	RB1285	\N	\N	none	12x85
7459	Rivet Zingué 12x85	RZ1285	\N	\N	cold	12x85
7460	Rivet Zingué à chaud 12x85	RZC1285	\N	\N	hot	12x85
7461	Rivet Acier 12x85	RA1285	\N	\N	acier	12x85
7462	Rivet Brut 12x90	RB1290	\N	\N	none	12x90
7463	Rivet Zingué 12x90	RZ1290	\N	\N	cold	12x90
7464	Rivet Zingué à chaud 12x90	RZC1290	\N	\N	hot	12x90
7465	Rivet Acier 12x90	RA1290	\N	\N	acier	12x90
7466	Rivet Brut 12x100	RB12100	\N	\N	none	12x100
7467	Rivet Zingué 12x100	RZ12100	\N	\N	cold	12x100
7468	Rivet Zingué à chaud 12x100	RZC12100	\N	\N	hot	12x100
7469	Rivet Acier 12x100	RA12100	\N	\N	acier	12x100
7470	Rivet Brut 12x110	RB12110	\N	\N	none	12x110
7471	Rivet Zingué 12x110	RZ12110	\N	\N	cold	12x110
7472	Rivet Zingué à chaud 12x110	RZC12110	\N	\N	hot	12x110
7473	Rivet Acier 12x110	RA12110	\N	\N	acier	12x110
7474	Rivet Brut 12x120	RB12120	\N	\N	none	12x120
7475	Rivet Zingué 12x120	RZ12120	\N	\N	cold	12x120
7476	Rivet Zingué à chaud 12x120	RZC12120	\N	\N	hot	12x120
7477	Rivet Acier 12x120	RA12120	\N	\N	acier	12x120
7478	Rivet Brut 12x130	RB12130	\N	\N	none	12x130
7479	Rivet Zingué 12x130	RZ12130	\N	\N	cold	12x130
7480	Rivet Zingué à chaud 12x130	RZC12130	\N	\N	hot	12x130
7481	Rivet Acier 12x130	RA12130	\N	\N	acier	12x130
7482	Rivet Brut 12x140	RB12140	\N	\N	none	12x140
7483	Rivet Zingué 12x140	RZ12140	\N	\N	cold	12x140
7484	Rivet Zingué à chaud 12x140	RZC12140	\N	\N	hot	12x140
7485	Rivet Acier 12x140	RA12140	\N	\N	acier	12x140
7486	Rivet Brut 12x150	RB12150	\N	\N	none	12x150
7487	Rivet Zingué 12x150	RZ12150	\N	\N	cold	12x150
7488	Rivet Zingué à chaud 12x150	RZC12150	\N	\N	hot	12x150
7489	Rivet Acier 12x150	RA12150	\N	\N	acier	12x150
7490	Rivet Brut 12x160	RB12160	\N	\N	none	12x160
7491	Rivet Zingué 12x160	RZ12160	\N	\N	cold	12x160
7492	Rivet Zingué à chaud 12x160	RZC12160	\N	\N	hot	12x160
7493	Rivet Acier 12x160	RA12160	\N	\N	acier	12x160
7494	Rivet Brut 12x170	RB12170	\N	\N	none	12x170
7495	Rivet Zingué 12x170	RZ12170	\N	\N	cold	12x170
7496	Rivet Zingué à chaud 12x170	RZC12170	\N	\N	hot	12x170
7497	Rivet Acier 12x170	RA12170	\N	\N	acier	12x170
7498	Rivet Brut 12x180	RB12180	\N	\N	none	12x180
7499	Rivet Zingué 12x180	RZ12180	\N	\N	cold	12x180
7500	Rivet Zingué à chaud 12x180	RZC12180	\N	\N	hot	12x180
7501	Rivet Acier 12x180	RA12180	\N	\N	acier	12x180
7502	Rivet Brut 12x190	RB12190	\N	\N	none	12x190
7503	Rivet Zingué 12x190	RZ12190	\N	\N	cold	12x190
7504	Rivet Zingué à chaud 12x190	RZC12190	\N	\N	hot	12x190
7505	Rivet Acier 12x190	RA12190	\N	\N	acier	12x190
7506	Rivet Brut 12x200	RB12200	\N	\N	none	12x200
7507	Rivet Zingué 12x200	RZ12200	\N	\N	cold	12x200
7508	Rivet Zingué à chaud 12x200	RZC12200	\N	\N	hot	12x200
7509	Rivet Acier 12x200	RA12200	\N	\N	acier	12x200
7510	Rivet Brut 14x12	RB1412	\N	\N	none	14x12
7511	Rivet Zingué 14x12	RZ1412	\N	\N	cold	14x12
7512	Rivet Zingué à chaud 14x12	RZC1412	\N	\N	hot	14x12
7513	Rivet Acier 14x12	RA1412	\N	\N	acier	14x12
7514	Rivet Brut 14x16	RB1416	\N	\N	none	14x16
7515	Rivet Zingué 14x16	RZ1416	\N	\N	cold	14x16
7516	Rivet Zingué à chaud 14x16	RZC1416	\N	\N	hot	14x16
7517	Rivet Acier 14x16	RA1416	\N	\N	acier	14x16
7518	Rivet Brut 14x20	RB1420	\N	\N	none	14x20
7519	Rivet Zingué 14x20	RZ1420	\N	\N	cold	14x20
7520	Rivet Zingué à chaud 14x20	RZC1420	\N	\N	hot	14x20
7521	Rivet Acier 14x20	RA1420	\N	\N	acier	14x20
7522	Rivet Brut 14x25	RB1425	\N	\N	none	14x25
7523	Rivet Zingué 14x25	RZ1425	\N	\N	cold	14x25
7524	Rivet Zingué à chaud 14x25	RZC1425	\N	\N	hot	14x25
7525	Rivet Acier 14x25	RA1425	\N	\N	acier	14x25
7526	Rivet Brut 14x30	RB1430	\N	\N	none	14x30
7527	Rivet Zingué 14x30	RZ1430	\N	\N	cold	14x30
7528	Rivet Zingué à chaud 14x30	RZC1430	\N	\N	hot	14x30
7529	Rivet Acier 14x30	RA1430	\N	\N	acier	14x30
7530	Rivet Brut 14x35	RB1435	\N	\N	none	14x35
7531	Rivet Zingué 14x35	RZ1435	\N	\N	cold	14x35
7532	Rivet Zingué à chaud 14x35	RZC1435	\N	\N	hot	14x35
7533	Rivet Acier 14x35	RA1435	\N	\N	acier	14x35
7534	Rivet Brut 14x40	RB1440	\N	\N	none	14x40
7535	Rivet Zingué 14x40	RZ1440	\N	\N	cold	14x40
7536	Rivet Zingué à chaud 14x40	RZC1440	\N	\N	hot	14x40
7537	Rivet Acier 14x40	RA1440	\N	\N	acier	14x40
7538	Rivet Brut 14x45	RB1445	\N	\N	none	14x45
7539	Rivet Zingué 14x45	RZ1445	\N	\N	cold	14x45
7540	Rivet Zingué à chaud 14x45	RZC1445	\N	\N	hot	14x45
7541	Rivet Acier 14x45	RA1445	\N	\N	acier	14x45
7542	Rivet Brut 14x50	RB1450	\N	\N	none	14x50
7543	Rivet Zingué 14x50	RZ1450	\N	\N	cold	14x50
7544	Rivet Zingué à chaud 14x50	RZC1450	\N	\N	hot	14x50
7545	Rivet Acier 14x50	RA1450	\N	\N	acier	14x50
7546	Rivet Brut 14x55	RB1455	\N	\N	none	14x55
7547	Rivet Zingué 14x55	RZ1455	\N	\N	cold	14x55
7548	Rivet Zingué à chaud 14x55	RZC1455	\N	\N	hot	14x55
7549	Rivet Acier 14x55	RA1455	\N	\N	acier	14x55
7550	Rivet Brut 14x60	RB1460	\N	\N	none	14x60
7551	Rivet Zingué 14x60	RZ1460	\N	\N	cold	14x60
7552	Rivet Zingué à chaud 14x60	RZC1460	\N	\N	hot	14x60
7553	Rivet Acier 14x60	RA1460	\N	\N	acier	14x60
7554	Rivet Brut 14x65	RB1465	\N	\N	none	14x65
7555	Rivet Zingué 14x65	RZ1465	\N	\N	cold	14x65
7556	Rivet Zingué à chaud 14x65	RZC1465	\N	\N	hot	14x65
7557	Rivet Acier 14x65	RA1465	\N	\N	acier	14x65
7558	Rivet Brut 14x70	RB1470	\N	\N	none	14x70
7559	Rivet Zingué 14x70	RZ1470	\N	\N	cold	14x70
7560	Rivet Zingué à chaud 14x70	RZC1470	\N	\N	hot	14x70
7561	Rivet Acier 14x70	RA1470	\N	\N	acier	14x70
7562	Rivet Brut 14x75	RB1475	\N	\N	none	14x75
7563	Rivet Zingué 14x75	RZ1475	\N	\N	cold	14x75
7564	Rivet Zingué à chaud 14x75	RZC1475	\N	\N	hot	14x75
7565	Rivet Acier 14x75	RA1475	\N	\N	acier	14x75
7566	Rivet Brut 14x80	RB1480	\N	\N	none	14x80
7567	Rivet Zingué 14x80	RZ1480	\N	\N	cold	14x80
7568	Rivet Zingué à chaud 14x80	RZC1480	\N	\N	hot	14x80
7569	Rivet Acier 14x80	RA1480	\N	\N	acier	14x80
7570	Rivet Brut 14x85	RB1485	\N	\N	none	14x85
7571	Rivet Zingué 14x85	RZ1485	\N	\N	cold	14x85
7572	Rivet Zingué à chaud 14x85	RZC1485	\N	\N	hot	14x85
7573	Rivet Acier 14x85	RA1485	\N	\N	acier	14x85
7574	Rivet Brut 14x90	RB1490	\N	\N	none	14x90
7575	Rivet Zingué 14x90	RZ1490	\N	\N	cold	14x90
7576	Rivet Zingué à chaud 14x90	RZC1490	\N	\N	hot	14x90
7577	Rivet Acier 14x90	RA1490	\N	\N	acier	14x90
7578	Rivet Brut 14x100	RB14100	\N	\N	none	14x100
7579	Rivet Zingué 14x100	RZ14100	\N	\N	cold	14x100
7580	Rivet Zingué à chaud 14x100	RZC14100	\N	\N	hot	14x100
7581	Rivet Acier 14x100	RA14100	\N	\N	acier	14x100
7582	Rivet Brut 14x110	RB14110	\N	\N	none	14x110
7583	Rivet Zingué 14x110	RZ14110	\N	\N	cold	14x110
7584	Rivet Zingué à chaud 14x110	RZC14110	\N	\N	hot	14x110
7585	Rivet Acier 14x110	RA14110	\N	\N	acier	14x110
7586	Rivet Brut 14x120	RB14120	\N	\N	none	14x120
7587	Rivet Zingué 14x120	RZ14120	\N	\N	cold	14x120
7588	Rivet Zingué à chaud 14x120	RZC14120	\N	\N	hot	14x120
7589	Rivet Acier 14x120	RA14120	\N	\N	acier	14x120
7590	Rivet Brut 14x130	RB14130	\N	\N	none	14x130
7591	Rivet Zingué 14x130	RZ14130	\N	\N	cold	14x130
7592	Rivet Zingué à chaud 14x130	RZC14130	\N	\N	hot	14x130
7593	Rivet Acier 14x130	RA14130	\N	\N	acier	14x130
7594	Rivet Brut 14x140	RB14140	\N	\N	none	14x140
7595	Rivet Zingué 14x140	RZ14140	\N	\N	cold	14x140
7596	Rivet Zingué à chaud 14x140	RZC14140	\N	\N	hot	14x140
7597	Rivet Acier 14x140	RA14140	\N	\N	acier	14x140
7598	Rivet Brut 14x150	RB14150	\N	\N	none	14x150
7599	Rivet Zingué 14x150	RZ14150	\N	\N	cold	14x150
7600	Rivet Zingué à chaud 14x150	RZC14150	\N	\N	hot	14x150
7601	Rivet Acier 14x150	RA14150	\N	\N	acier	14x150
7602	Rivet Brut 14x160	RB14160	\N	\N	none	14x160
7603	Rivet Zingué 14x160	RZ14160	\N	\N	cold	14x160
7604	Rivet Zingué à chaud 14x160	RZC14160	\N	\N	hot	14x160
7605	Rivet Acier 14x160	RA14160	\N	\N	acier	14x160
7606	Rivet Brut 14x170	RB14170	\N	\N	none	14x170
7607	Rivet Zingué 14x170	RZ14170	\N	\N	cold	14x170
7608	Rivet Zingué à chaud 14x170	RZC14170	\N	\N	hot	14x170
7609	Rivet Acier 14x170	RA14170	\N	\N	acier	14x170
7610	Rivet Brut 14x180	RB14180	\N	\N	none	14x180
7611	Rivet Zingué 14x180	RZ14180	\N	\N	cold	14x180
7612	Rivet Zingué à chaud 14x180	RZC14180	\N	\N	hot	14x180
7613	Rivet Acier 14x180	RA14180	\N	\N	acier	14x180
7614	Rivet Brut 14x190	RB14190	\N	\N	none	14x190
7615	Rivet Zingué 14x190	RZ14190	\N	\N	cold	14x190
7616	Rivet Zingué à chaud 14x190	RZC14190	\N	\N	hot	14x190
7617	Rivet Acier 14x190	RA14190	\N	\N	acier	14x190
7618	Rivet Brut 14x200	RB14200	\N	\N	none	14x200
7619	Rivet Zingué 14x200	RZ14200	\N	\N	cold	14x200
7620	Rivet Zingué à chaud 14x200	RZC14200	\N	\N	hot	14x200
7621	Rivet Acier 14x200	RA14200	\N	\N	acier	14x200
7622	Rivet Brut 16x12	RB1612	\N	\N	none	16x12
7623	Rivet Zingué 16x12	RZ1612	\N	\N	cold	16x12
7624	Rivet Zingué à chaud 16x12	RZC1612	\N	\N	hot	16x12
7625	Rivet Acier 16x12	RA1612	\N	\N	acier	16x12
7626	Rivet Brut 16x16	RB1616	\N	\N	none	16x16
7627	Rivet Zingué 16x16	RZ1616	\N	\N	cold	16x16
7628	Rivet Zingué à chaud 16x16	RZC1616	\N	\N	hot	16x16
7629	Rivet Acier 16x16	RA1616	\N	\N	acier	16x16
7630	Rivet Brut 16x20	RB1620	\N	\N	none	16x20
7631	Rivet Zingué 16x20	RZ1620	\N	\N	cold	16x20
7632	Rivet Zingué à chaud 16x20	RZC1620	\N	\N	hot	16x20
7633	Rivet Acier 16x20	RA1620	\N	\N	acier	16x20
7634	Rivet Brut 16x25	RB1625	\N	\N	none	16x25
7635	Rivet Zingué 16x25	RZ1625	\N	\N	cold	16x25
7636	Rivet Zingué à chaud 16x25	RZC1625	\N	\N	hot	16x25
7637	Rivet Acier 16x25	RA1625	\N	\N	acier	16x25
7638	Rivet Brut 16x30	RB1630	\N	\N	none	16x30
7639	Rivet Zingué 16x30	RZ1630	\N	\N	cold	16x30
7640	Rivet Zingué à chaud 16x30	RZC1630	\N	\N	hot	16x30
7641	Rivet Acier 16x30	RA1630	\N	\N	acier	16x30
7642	Rivet Brut 16x35	RB1635	\N	\N	none	16x35
7643	Rivet Zingué 16x35	RZ1635	\N	\N	cold	16x35
7644	Rivet Zingué à chaud 16x35	RZC1635	\N	\N	hot	16x35
7645	Rivet Acier 16x35	RA1635	\N	\N	acier	16x35
7646	Rivet Brut 16x40	RB1640	\N	\N	none	16x40
7647	Rivet Zingué 16x40	RZ1640	\N	\N	cold	16x40
7648	Rivet Zingué à chaud 16x40	RZC1640	\N	\N	hot	16x40
7649	Rivet Acier 16x40	RA1640	\N	\N	acier	16x40
7650	Rivet Brut 16x45	RB1645	\N	\N	none	16x45
7651	Rivet Zingué 16x45	RZ1645	\N	\N	cold	16x45
7652	Rivet Zingué à chaud 16x45	RZC1645	\N	\N	hot	16x45
7653	Rivet Acier 16x45	RA1645	\N	\N	acier	16x45
7654	Rivet Brut 16x50	RB1650	\N	\N	none	16x50
7655	Rivet Zingué 16x50	RZ1650	\N	\N	cold	16x50
7656	Rivet Zingué à chaud 16x50	RZC1650	\N	\N	hot	16x50
7657	Rivet Acier 16x50	RA1650	\N	\N	acier	16x50
7658	Rivet Brut 16x55	RB1655	\N	\N	none	16x55
7659	Rivet Zingué 16x55	RZ1655	\N	\N	cold	16x55
7660	Rivet Zingué à chaud 16x55	RZC1655	\N	\N	hot	16x55
7661	Rivet Acier 16x55	RA1655	\N	\N	acier	16x55
7662	Rivet Brut 16x60	RB1660	\N	\N	none	16x60
7663	Rivet Zingué 16x60	RZ1660	\N	\N	cold	16x60
7664	Rivet Zingué à chaud 16x60	RZC1660	\N	\N	hot	16x60
7665	Rivet Acier 16x60	RA1660	\N	\N	acier	16x60
7666	Rivet Brut 16x65	RB1665	\N	\N	none	16x65
7667	Rivet Zingué 16x65	RZ1665	\N	\N	cold	16x65
7668	Rivet Zingué à chaud 16x65	RZC1665	\N	\N	hot	16x65
7669	Rivet Acier 16x65	RA1665	\N	\N	acier	16x65
7670	Rivet Brut 16x70	RB1670	\N	\N	none	16x70
7671	Rivet Zingué 16x70	RZ1670	\N	\N	cold	16x70
7672	Rivet Zingué à chaud 16x70	RZC1670	\N	\N	hot	16x70
7673	Rivet Acier 16x70	RA1670	\N	\N	acier	16x70
7674	Rivet Brut 16x75	RB1675	\N	\N	none	16x75
7675	Rivet Zingué 16x75	RZ1675	\N	\N	cold	16x75
7676	Rivet Zingué à chaud 16x75	RZC1675	\N	\N	hot	16x75
7677	Rivet Acier 16x75	RA1675	\N	\N	acier	16x75
7678	Rivet Brut 16x80	RB1680	\N	\N	none	16x80
7679	Rivet Zingué 16x80	RZ1680	\N	\N	cold	16x80
7680	Rivet Zingué à chaud 16x80	RZC1680	\N	\N	hot	16x80
7681	Rivet Acier 16x80	RA1680	\N	\N	acier	16x80
7682	Rivet Brut 16x85	RB1685	\N	\N	none	16x85
7683	Rivet Zingué 16x85	RZ1685	\N	\N	cold	16x85
7684	Rivet Zingué à chaud 16x85	RZC1685	\N	\N	hot	16x85
7685	Rivet Acier 16x85	RA1685	\N	\N	acier	16x85
7686	Rivet Brut 16x90	RB1690	\N	\N	none	16x90
7687	Rivet Zingué 16x90	RZ1690	\N	\N	cold	16x90
7688	Rivet Zingué à chaud 16x90	RZC1690	\N	\N	hot	16x90
7689	Rivet Acier 16x90	RA1690	\N	\N	acier	16x90
7690	Rivet Brut 16x100	RB16100	\N	\N	none	16x100
7691	Rivet Zingué 16x100	RZ16100	\N	\N	cold	16x100
7692	Rivet Zingué à chaud 16x100	RZC16100	\N	\N	hot	16x100
7693	Rivet Acier 16x100	RA16100	\N	\N	acier	16x100
7694	Rivet Brut 16x110	RB16110	\N	\N	none	16x110
7695	Rivet Zingué 16x110	RZ16110	\N	\N	cold	16x110
7696	Rivet Zingué à chaud 16x110	RZC16110	\N	\N	hot	16x110
7697	Rivet Acier 16x110	RA16110	\N	\N	acier	16x110
7698	Rivet Brut 16x120	RB16120	\N	\N	none	16x120
7699	Rivet Zingué 16x120	RZ16120	\N	\N	cold	16x120
7700	Rivet Zingué à chaud 16x120	RZC16120	\N	\N	hot	16x120
7701	Rivet Acier 16x120	RA16120	\N	\N	acier	16x120
7702	Rivet Brut 16x130	RB16130	\N	\N	none	16x130
7703	Rivet Zingué 16x130	RZ16130	\N	\N	cold	16x130
7704	Rivet Zingué à chaud 16x130	RZC16130	\N	\N	hot	16x130
7705	Rivet Acier 16x130	RA16130	\N	\N	acier	16x130
7706	Rivet Brut 16x140	RB16140	\N	\N	none	16x140
7707	Rivet Zingué 16x140	RZ16140	\N	\N	cold	16x140
7708	Rivet Zingué à chaud 16x140	RZC16140	\N	\N	hot	16x140
7709	Rivet Acier 16x140	RA16140	\N	\N	acier	16x140
7710	Rivet Brut 16x150	RB16150	\N	\N	none	16x150
7711	Rivet Zingué 16x150	RZ16150	\N	\N	cold	16x150
7712	Rivet Zingué à chaud 16x150	RZC16150	\N	\N	hot	16x150
7713	Rivet Acier 16x150	RA16150	\N	\N	acier	16x150
7714	Rivet Brut 16x160	RB16160	\N	\N	none	16x160
7715	Rivet Zingué 16x160	RZ16160	\N	\N	cold	16x160
7716	Rivet Zingué à chaud 16x160	RZC16160	\N	\N	hot	16x160
7717	Rivet Acier 16x160	RA16160	\N	\N	acier	16x160
7718	Rivet Brut 16x170	RB16170	\N	\N	none	16x170
7719	Rivet Zingué 16x170	RZ16170	\N	\N	cold	16x170
7720	Rivet Zingué à chaud 16x170	RZC16170	\N	\N	hot	16x170
7721	Rivet Acier 16x170	RA16170	\N	\N	acier	16x170
7722	Rivet Brut 16x180	RB16180	\N	\N	none	16x180
7723	Rivet Zingué 16x180	RZ16180	\N	\N	cold	16x180
7724	Rivet Zingué à chaud 16x180	RZC16180	\N	\N	hot	16x180
7725	Rivet Acier 16x180	RA16180	\N	\N	acier	16x180
7726	Rivet Brut 16x190	RB16190	\N	\N	none	16x190
7727	Rivet Zingué 16x190	RZ16190	\N	\N	cold	16x190
7728	Rivet Zingué à chaud 16x190	RZC16190	\N	\N	hot	16x190
7729	Rivet Acier 16x190	RA16190	\N	\N	acier	16x190
7730	Rivet Brut 16x200	RB16200	\N	\N	none	16x200
7731	Rivet Zingué 16x200	RZ16200	\N	\N	cold	16x200
7732	Rivet Zingué à chaud 16x200	RZC16200	\N	\N	hot	16x200
7733	Rivet Acier 16x200	RA16200	\N	\N	acier	16x200
7734	Rivet Brut 18x12	RB1812	\N	\N	none	18x12
7735	Rivet Zingué 18x12	RZ1812	\N	\N	cold	18x12
7736	Rivet Zingué à chaud 18x12	RZC1812	\N	\N	hot	18x12
7737	Rivet Acier 18x12	RA1812	\N	\N	acier	18x12
7738	Rivet Brut 18x16	RB1816	\N	\N	none	18x16
7739	Rivet Zingué 18x16	RZ1816	\N	\N	cold	18x16
7740	Rivet Zingué à chaud 18x16	RZC1816	\N	\N	hot	18x16
7741	Rivet Acier 18x16	RA1816	\N	\N	acier	18x16
7742	Rivet Brut 18x20	RB1820	\N	\N	none	18x20
7743	Rivet Zingué 18x20	RZ1820	\N	\N	cold	18x20
7744	Rivet Zingué à chaud 18x20	RZC1820	\N	\N	hot	18x20
7745	Rivet Acier 18x20	RA1820	\N	\N	acier	18x20
7746	Rivet Brut 18x25	RB1825	\N	\N	none	18x25
7747	Rivet Zingué 18x25	RZ1825	\N	\N	cold	18x25
7748	Rivet Zingué à chaud 18x25	RZC1825	\N	\N	hot	18x25
7749	Rivet Acier 18x25	RA1825	\N	\N	acier	18x25
7750	Rivet Brut 18x30	RB1830	\N	\N	none	18x30
7751	Rivet Zingué 18x30	RZ1830	\N	\N	cold	18x30
7752	Rivet Zingué à chaud 18x30	RZC1830	\N	\N	hot	18x30
7753	Rivet Acier 18x30	RA1830	\N	\N	acier	18x30
7754	Rivet Brut 18x35	RB1835	\N	\N	none	18x35
7755	Rivet Zingué 18x35	RZ1835	\N	\N	cold	18x35
7756	Rivet Zingué à chaud 18x35	RZC1835	\N	\N	hot	18x35
7757	Rivet Acier 18x35	RA1835	\N	\N	acier	18x35
7758	Rivet Brut 18x40	RB1840	\N	\N	none	18x40
7759	Rivet Zingué 18x40	RZ1840	\N	\N	cold	18x40
7760	Rivet Zingué à chaud 18x40	RZC1840	\N	\N	hot	18x40
7761	Rivet Acier 18x40	RA1840	\N	\N	acier	18x40
7762	Rivet Brut 18x45	RB1845	\N	\N	none	18x45
7763	Rivet Zingué 18x45	RZ1845	\N	\N	cold	18x45
7764	Rivet Zingué à chaud 18x45	RZC1845	\N	\N	hot	18x45
7765	Rivet Acier 18x45	RA1845	\N	\N	acier	18x45
7766	Rivet Brut 18x50	RB1850	\N	\N	none	18x50
7767	Rivet Zingué 18x50	RZ1850	\N	\N	cold	18x50
7768	Rivet Zingué à chaud 18x50	RZC1850	\N	\N	hot	18x50
7769	Rivet Acier 18x50	RA1850	\N	\N	acier	18x50
7770	Rivet Brut 18x55	RB1855	\N	\N	none	18x55
7771	Rivet Zingué 18x55	RZ1855	\N	\N	cold	18x55
7772	Rivet Zingué à chaud 18x55	RZC1855	\N	\N	hot	18x55
7773	Rivet Acier 18x55	RA1855	\N	\N	acier	18x55
7774	Rivet Brut 18x60	RB1860	\N	\N	none	18x60
7775	Rivet Zingué 18x60	RZ1860	\N	\N	cold	18x60
7776	Rivet Zingué à chaud 18x60	RZC1860	\N	\N	hot	18x60
7777	Rivet Acier 18x60	RA1860	\N	\N	acier	18x60
7778	Rivet Brut 18x65	RB1865	\N	\N	none	18x65
7779	Rivet Zingué 18x65	RZ1865	\N	\N	cold	18x65
7780	Rivet Zingué à chaud 18x65	RZC1865	\N	\N	hot	18x65
7781	Rivet Acier 18x65	RA1865	\N	\N	acier	18x65
7782	Rivet Brut 18x70	RB1870	\N	\N	none	18x70
7783	Rivet Zingué 18x70	RZ1870	\N	\N	cold	18x70
7784	Rivet Zingué à chaud 18x70	RZC1870	\N	\N	hot	18x70
7785	Rivet Acier 18x70	RA1870	\N	\N	acier	18x70
7786	Rivet Brut 18x75	RB1875	\N	\N	none	18x75
7787	Rivet Zingué 18x75	RZ1875	\N	\N	cold	18x75
7788	Rivet Zingué à chaud 18x75	RZC1875	\N	\N	hot	18x75
7789	Rivet Acier 18x75	RA1875	\N	\N	acier	18x75
7790	Rivet Brut 18x80	RB1880	\N	\N	none	18x80
7791	Rivet Zingué 18x80	RZ1880	\N	\N	cold	18x80
7792	Rivet Zingué à chaud 18x80	RZC1880	\N	\N	hot	18x80
7793	Rivet Acier 18x80	RA1880	\N	\N	acier	18x80
7794	Rivet Brut 18x85	RB1885	\N	\N	none	18x85
7795	Rivet Zingué 18x85	RZ1885	\N	\N	cold	18x85
7796	Rivet Zingué à chaud 18x85	RZC1885	\N	\N	hot	18x85
7797	Rivet Acier 18x85	RA1885	\N	\N	acier	18x85
7798	Rivet Brut 18x90	RB1890	\N	\N	none	18x90
7799	Rivet Zingué 18x90	RZ1890	\N	\N	cold	18x90
7800	Rivet Zingué à chaud 18x90	RZC1890	\N	\N	hot	18x90
7801	Rivet Acier 18x90	RA1890	\N	\N	acier	18x90
7802	Rivet Brut 18x100	RB18100	\N	\N	none	18x100
7803	Rivet Zingué 18x100	RZ18100	\N	\N	cold	18x100
7804	Rivet Zingué à chaud 18x100	RZC18100	\N	\N	hot	18x100
7805	Rivet Acier 18x100	RA18100	\N	\N	acier	18x100
7806	Rivet Brut 18x110	RB18110	\N	\N	none	18x110
7807	Rivet Zingué 18x110	RZ18110	\N	\N	cold	18x110
7808	Rivet Zingué à chaud 18x110	RZC18110	\N	\N	hot	18x110
7809	Rivet Acier 18x110	RA18110	\N	\N	acier	18x110
7810	Rivet Brut 18x120	RB18120	\N	\N	none	18x120
7811	Rivet Zingué 18x120	RZ18120	\N	\N	cold	18x120
7812	Rivet Zingué à chaud 18x120	RZC18120	\N	\N	hot	18x120
7813	Rivet Acier 18x120	RA18120	\N	\N	acier	18x120
7814	Rivet Brut 18x130	RB18130	\N	\N	none	18x130
7815	Rivet Zingué 18x130	RZ18130	\N	\N	cold	18x130
7816	Rivet Zingué à chaud 18x130	RZC18130	\N	\N	hot	18x130
7817	Rivet Acier 18x130	RA18130	\N	\N	acier	18x130
7818	Rivet Brut 18x140	RB18140	\N	\N	none	18x140
7819	Rivet Zingué 18x140	RZ18140	\N	\N	cold	18x140
7820	Rivet Zingué à chaud 18x140	RZC18140	\N	\N	hot	18x140
7821	Rivet Acier 18x140	RA18140	\N	\N	acier	18x140
7822	Rivet Brut 18x150	RB18150	\N	\N	none	18x150
7823	Rivet Zingué 18x150	RZ18150	\N	\N	cold	18x150
7824	Rivet Zingué à chaud 18x150	RZC18150	\N	\N	hot	18x150
7825	Rivet Acier 18x150	RA18150	\N	\N	acier	18x150
7826	Rivet Brut 18x160	RB18160	\N	\N	none	18x160
7827	Rivet Zingué 18x160	RZ18160	\N	\N	cold	18x160
7828	Rivet Zingué à chaud 18x160	RZC18160	\N	\N	hot	18x160
7829	Rivet Acier 18x160	RA18160	\N	\N	acier	18x160
7830	Rivet Brut 18x170	RB18170	\N	\N	none	18x170
7831	Rivet Zingué 18x170	RZ18170	\N	\N	cold	18x170
7832	Rivet Zingué à chaud 18x170	RZC18170	\N	\N	hot	18x170
7833	Rivet Acier 18x170	RA18170	\N	\N	acier	18x170
7834	Rivet Brut 18x180	RB18180	\N	\N	none	18x180
7835	Rivet Zingué 18x180	RZ18180	\N	\N	cold	18x180
7836	Rivet Zingué à chaud 18x180	RZC18180	\N	\N	hot	18x180
7837	Rivet Acier 18x180	RA18180	\N	\N	acier	18x180
7838	Rivet Brut 18x190	RB18190	\N	\N	none	18x190
7839	Rivet Zingué 18x190	RZ18190	\N	\N	cold	18x190
7840	Rivet Zingué à chaud 18x190	RZC18190	\N	\N	hot	18x190
7841	Rivet Acier 18x190	RA18190	\N	\N	acier	18x190
7842	Rivet Brut 18x200	RB18200	\N	\N	none	18x200
7843	Rivet Zingué 18x200	RZ18200	\N	\N	cold	18x200
7844	Rivet Zingué à chaud 18x200	RZC18200	\N	\N	hot	18x200
7845	Rivet Acier 18x200	RA18200	\N	\N	acier	18x200
7846	Rivet Brut 20x12	RB2012	\N	\N	none	20x12
7847	Rivet Zingué 20x12	RZ2012	\N	\N	cold	20x12
7848	Rivet Zingué à chaud 20x12	RZC2012	\N	\N	hot	20x12
7849	Rivet Acier 20x12	RA2012	\N	\N	acier	20x12
7850	Rivet Brut 20x16	RB2016	\N	\N	none	20x16
7851	Rivet Zingué 20x16	RZ2016	\N	\N	cold	20x16
7852	Rivet Zingué à chaud 20x16	RZC2016	\N	\N	hot	20x16
7853	Rivet Acier 20x16	RA2016	\N	\N	acier	20x16
7854	Rivet Brut 20x20	RB2020	\N	\N	none	20x20
7855	Rivet Zingué 20x20	RZ2020	\N	\N	cold	20x20
7856	Rivet Zingué à chaud 20x20	RZC2020	\N	\N	hot	20x20
7857	Rivet Acier 20x20	RA2020	\N	\N	acier	20x20
7858	Rivet Brut 20x25	RB2025	\N	\N	none	20x25
7859	Rivet Zingué 20x25	RZ2025	\N	\N	cold	20x25
7860	Rivet Zingué à chaud 20x25	RZC2025	\N	\N	hot	20x25
7861	Rivet Acier 20x25	RA2025	\N	\N	acier	20x25
7862	Rivet Brut 20x30	RB2030	\N	\N	none	20x30
7863	Rivet Zingué 20x30	RZ2030	\N	\N	cold	20x30
7864	Rivet Zingué à chaud 20x30	RZC2030	\N	\N	hot	20x30
7865	Rivet Acier 20x30	RA2030	\N	\N	acier	20x30
7866	Rivet Brut 20x35	RB2035	\N	\N	none	20x35
7867	Rivet Zingué 20x35	RZ2035	\N	\N	cold	20x35
7868	Rivet Zingué à chaud 20x35	RZC2035	\N	\N	hot	20x35
7869	Rivet Acier 20x35	RA2035	\N	\N	acier	20x35
7870	Rivet Brut 20x40	RB2040	\N	\N	none	20x40
7871	Rivet Zingué 20x40	RZ2040	\N	\N	cold	20x40
7872	Rivet Zingué à chaud 20x40	RZC2040	\N	\N	hot	20x40
7873	Rivet Acier 20x40	RA2040	\N	\N	acier	20x40
7874	Rivet Brut 20x45	RB2045	\N	\N	none	20x45
7875	Rivet Zingué 20x45	RZ2045	\N	\N	cold	20x45
7876	Rivet Zingué à chaud 20x45	RZC2045	\N	\N	hot	20x45
7877	Rivet Acier 20x45	RA2045	\N	\N	acier	20x45
7878	Rivet Brut 20x50	RB2050	\N	\N	none	20x50
7879	Rivet Zingué 20x50	RZ2050	\N	\N	cold	20x50
7880	Rivet Zingué à chaud 20x50	RZC2050	\N	\N	hot	20x50
7881	Rivet Acier 20x50	RA2050	\N	\N	acier	20x50
7882	Rivet Brut 20x55	RB2055	\N	\N	none	20x55
7883	Rivet Zingué 20x55	RZ2055	\N	\N	cold	20x55
7884	Rivet Zingué à chaud 20x55	RZC2055	\N	\N	hot	20x55
7885	Rivet Acier 20x55	RA2055	\N	\N	acier	20x55
7886	Rivet Brut 20x60	RB2060	\N	\N	none	20x60
7887	Rivet Zingué 20x60	RZ2060	\N	\N	cold	20x60
7888	Rivet Zingué à chaud 20x60	RZC2060	\N	\N	hot	20x60
7889	Rivet Acier 20x60	RA2060	\N	\N	acier	20x60
7890	Rivet Brut 20x65	RB2065	\N	\N	none	20x65
7891	Rivet Zingué 20x65	RZ2065	\N	\N	cold	20x65
7892	Rivet Zingué à chaud 20x65	RZC2065	\N	\N	hot	20x65
7893	Rivet Acier 20x65	RA2065	\N	\N	acier	20x65
7894	Rivet Brut 20x70	RB2070	\N	\N	none	20x70
7895	Rivet Zingué 20x70	RZ2070	\N	\N	cold	20x70
7896	Rivet Zingué à chaud 20x70	RZC2070	\N	\N	hot	20x70
7897	Rivet Acier 20x70	RA2070	\N	\N	acier	20x70
7898	Rivet Brut 20x75	RB2075	\N	\N	none	20x75
7899	Rivet Zingué 20x75	RZ2075	\N	\N	cold	20x75
7900	Rivet Zingué à chaud 20x75	RZC2075	\N	\N	hot	20x75
7901	Rivet Acier 20x75	RA2075	\N	\N	acier	20x75
7902	Rivet Brut 20x80	RB2080	\N	\N	none	20x80
7903	Rivet Zingué 20x80	RZ2080	\N	\N	cold	20x80
7904	Rivet Zingué à chaud 20x80	RZC2080	\N	\N	hot	20x80
7905	Rivet Acier 20x80	RA2080	\N	\N	acier	20x80
7906	Rivet Brut 20x85	RB2085	\N	\N	none	20x85
7907	Rivet Zingué 20x85	RZ2085	\N	\N	cold	20x85
7908	Rivet Zingué à chaud 20x85	RZC2085	\N	\N	hot	20x85
7909	Rivet Acier 20x85	RA2085	\N	\N	acier	20x85
7910	Rivet Brut 20x90	RB2090	\N	\N	none	20x90
7911	Rivet Zingué 20x90	RZ2090	\N	\N	cold	20x90
7912	Rivet Zingué à chaud 20x90	RZC2090	\N	\N	hot	20x90
7913	Rivet Acier 20x90	RA2090	\N	\N	acier	20x90
7914	Rivet Brut 20x100	RB20100	\N	\N	none	20x100
7915	Rivet Zingué 20x100	RZ20100	\N	\N	cold	20x100
7916	Rivet Zingué à chaud 20x100	RZC20100	\N	\N	hot	20x100
7917	Rivet Acier 20x100	RA20100	\N	\N	acier	20x100
7918	Rivet Brut 20x110	RB20110	\N	\N	none	20x110
7919	Rivet Zingué 20x110	RZ20110	\N	\N	cold	20x110
7920	Rivet Zingué à chaud 20x110	RZC20110	\N	\N	hot	20x110
7921	Rivet Acier 20x110	RA20110	\N	\N	acier	20x110
7922	Rivet Brut 20x120	RB20120	\N	\N	none	20x120
7923	Rivet Zingué 20x120	RZ20120	\N	\N	cold	20x120
7924	Rivet Zingué à chaud 20x120	RZC20120	\N	\N	hot	20x120
7925	Rivet Acier 20x120	RA20120	\N	\N	acier	20x120
7926	Rivet Brut 20x130	RB20130	\N	\N	none	20x130
7927	Rivet Zingué 20x130	RZ20130	\N	\N	cold	20x130
7928	Rivet Zingué à chaud 20x130	RZC20130	\N	\N	hot	20x130
7929	Rivet Acier 20x130	RA20130	\N	\N	acier	20x130
7930	Rivet Brut 20x140	RB20140	\N	\N	none	20x140
7931	Rivet Zingué 20x140	RZ20140	\N	\N	cold	20x140
7932	Rivet Zingué à chaud 20x140	RZC20140	\N	\N	hot	20x140
7933	Rivet Acier 20x140	RA20140	\N	\N	acier	20x140
7934	Rivet Brut 20x150	RB20150	\N	\N	none	20x150
7935	Rivet Zingué 20x150	RZ20150	\N	\N	cold	20x150
7936	Rivet Zingué à chaud 20x150	RZC20150	\N	\N	hot	20x150
7937	Rivet Acier 20x150	RA20150	\N	\N	acier	20x150
7938	Rivet Brut 20x160	RB20160	\N	\N	none	20x160
7939	Rivet Zingué 20x160	RZ20160	\N	\N	cold	20x160
7940	Rivet Zingué à chaud 20x160	RZC20160	\N	\N	hot	20x160
7941	Rivet Acier 20x160	RA20160	\N	\N	acier	20x160
7942	Rivet Brut 20x170	RB20170	\N	\N	none	20x170
7943	Rivet Zingué 20x170	RZ20170	\N	\N	cold	20x170
7944	Rivet Zingué à chaud 20x170	RZC20170	\N	\N	hot	20x170
7945	Rivet Acier 20x170	RA20170	\N	\N	acier	20x170
7946	Rivet Brut 20x180	RB20180	\N	\N	none	20x180
7947	Rivet Zingué 20x180	RZ20180	\N	\N	cold	20x180
7948	Rivet Zingué à chaud 20x180	RZC20180	\N	\N	hot	20x180
7949	Rivet Acier 20x180	RA20180	\N	\N	acier	20x180
7950	Rivet Brut 20x190	RB20190	\N	\N	none	20x190
7951	Rivet Zingué 20x190	RZ20190	\N	\N	cold	20x190
7952	Rivet Zingué à chaud 20x190	RZC20190	\N	\N	hot	20x190
7953	Rivet Acier 20x190	RA20190	\N	\N	acier	20x190
7954	Rivet Brut 20x200	RB20200	\N	\N	none	20x200
7955	Rivet Zingué 20x200	RZ20200	\N	\N	cold	20x200
7956	Rivet Zingué à chaud 20x200	RZC20200	\N	\N	hot	20x200
7957	Rivet Acier 20x200	RA20200	\N	\N	acier	20x200
7958	Rivet Brut 22x12	RB2212	\N	\N	none	22x12
7959	Rivet Zingué 22x12	RZ2212	\N	\N	cold	22x12
7960	Rivet Zingué à chaud 22x12	RZC2212	\N	\N	hot	22x12
7961	Rivet Acier 22x12	RA2212	\N	\N	acier	22x12
7962	Rivet Brut 22x16	RB2216	\N	\N	none	22x16
7963	Rivet Zingué 22x16	RZ2216	\N	\N	cold	22x16
7964	Rivet Zingué à chaud 22x16	RZC2216	\N	\N	hot	22x16
7965	Rivet Acier 22x16	RA2216	\N	\N	acier	22x16
7966	Rivet Brut 22x20	RB2220	\N	\N	none	22x20
7967	Rivet Zingué 22x20	RZ2220	\N	\N	cold	22x20
7968	Rivet Zingué à chaud 22x20	RZC2220	\N	\N	hot	22x20
7969	Rivet Acier 22x20	RA2220	\N	\N	acier	22x20
7970	Rivet Brut 22x25	RB2225	\N	\N	none	22x25
7971	Rivet Zingué 22x25	RZ2225	\N	\N	cold	22x25
7972	Rivet Zingué à chaud 22x25	RZC2225	\N	\N	hot	22x25
7973	Rivet Acier 22x25	RA2225	\N	\N	acier	22x25
7974	Rivet Brut 22x30	RB2230	\N	\N	none	22x30
7975	Rivet Zingué 22x30	RZ2230	\N	\N	cold	22x30
7976	Rivet Zingué à chaud 22x30	RZC2230	\N	\N	hot	22x30
7977	Rivet Acier 22x30	RA2230	\N	\N	acier	22x30
7978	Rivet Brut 22x35	RB2235	\N	\N	none	22x35
7979	Rivet Zingué 22x35	RZ2235	\N	\N	cold	22x35
7980	Rivet Zingué à chaud 22x35	RZC2235	\N	\N	hot	22x35
7981	Rivet Acier 22x35	RA2235	\N	\N	acier	22x35
7982	Rivet Brut 22x40	RB2240	\N	\N	none	22x40
7983	Rivet Zingué 22x40	RZ2240	\N	\N	cold	22x40
7984	Rivet Zingué à chaud 22x40	RZC2240	\N	\N	hot	22x40
7985	Rivet Acier 22x40	RA2240	\N	\N	acier	22x40
7986	Rivet Brut 22x45	RB2245	\N	\N	none	22x45
7987	Rivet Zingué 22x45	RZ2245	\N	\N	cold	22x45
7988	Rivet Zingué à chaud 22x45	RZC2245	\N	\N	hot	22x45
7989	Rivet Acier 22x45	RA2245	\N	\N	acier	22x45
7990	Rivet Brut 22x50	RB2250	\N	\N	none	22x50
7991	Rivet Zingué 22x50	RZ2250	\N	\N	cold	22x50
7992	Rivet Zingué à chaud 22x50	RZC2250	\N	\N	hot	22x50
7993	Rivet Acier 22x50	RA2250	\N	\N	acier	22x50
7994	Rivet Brut 22x55	RB2255	\N	\N	none	22x55
7995	Rivet Zingué 22x55	RZ2255	\N	\N	cold	22x55
7996	Rivet Zingué à chaud 22x55	RZC2255	\N	\N	hot	22x55
7997	Rivet Acier 22x55	RA2255	\N	\N	acier	22x55
7998	Rivet Brut 22x60	RB2260	\N	\N	none	22x60
7999	Rivet Zingué 22x60	RZ2260	\N	\N	cold	22x60
8000	Rivet Zingué à chaud 22x60	RZC2260	\N	\N	hot	22x60
8001	Rivet Acier 22x60	RA2260	\N	\N	acier	22x60
8002	Rivet Brut 22x65	RB2265	\N	\N	none	22x65
8003	Rivet Zingué 22x65	RZ2265	\N	\N	cold	22x65
8004	Rivet Zingué à chaud 22x65	RZC2265	\N	\N	hot	22x65
8005	Rivet Acier 22x65	RA2265	\N	\N	acier	22x65
8006	Rivet Brut 22x70	RB2270	\N	\N	none	22x70
8007	Rivet Zingué 22x70	RZ2270	\N	\N	cold	22x70
8008	Rivet Zingué à chaud 22x70	RZC2270	\N	\N	hot	22x70
8009	Rivet Acier 22x70	RA2270	\N	\N	acier	22x70
8010	Rivet Brut 22x75	RB2275	\N	\N	none	22x75
8011	Rivet Zingué 22x75	RZ2275	\N	\N	cold	22x75
8012	Rivet Zingué à chaud 22x75	RZC2275	\N	\N	hot	22x75
8013	Rivet Acier 22x75	RA2275	\N	\N	acier	22x75
8014	Rivet Brut 22x80	RB2280	\N	\N	none	22x80
8015	Rivet Zingué 22x80	RZ2280	\N	\N	cold	22x80
8016	Rivet Zingué à chaud 22x80	RZC2280	\N	\N	hot	22x80
8017	Rivet Acier 22x80	RA2280	\N	\N	acier	22x80
8018	Rivet Brut 22x85	RB2285	\N	\N	none	22x85
8019	Rivet Zingué 22x85	RZ2285	\N	\N	cold	22x85
8020	Rivet Zingué à chaud 22x85	RZC2285	\N	\N	hot	22x85
8021	Rivet Acier 22x85	RA2285	\N	\N	acier	22x85
8022	Rivet Brut 22x90	RB2290	\N	\N	none	22x90
8023	Rivet Zingué 22x90	RZ2290	\N	\N	cold	22x90
8024	Rivet Zingué à chaud 22x90	RZC2290	\N	\N	hot	22x90
8025	Rivet Acier 22x90	RA2290	\N	\N	acier	22x90
8026	Rivet Brut 22x100	RB22100	\N	\N	none	22x100
8027	Rivet Zingué 22x100	RZ22100	\N	\N	cold	22x100
8028	Rivet Zingué à chaud 22x100	RZC22100	\N	\N	hot	22x100
8029	Rivet Acier 22x100	RA22100	\N	\N	acier	22x100
8030	Rivet Brut 22x110	RB22110	\N	\N	none	22x110
8031	Rivet Zingué 22x110	RZ22110	\N	\N	cold	22x110
8032	Rivet Zingué à chaud 22x110	RZC22110	\N	\N	hot	22x110
8033	Rivet Acier 22x110	RA22110	\N	\N	acier	22x110
8034	Rivet Brut 22x120	RB22120	\N	\N	none	22x120
8035	Rivet Zingué 22x120	RZ22120	\N	\N	cold	22x120
8036	Rivet Zingué à chaud 22x120	RZC22120	\N	\N	hot	22x120
8037	Rivet Acier 22x120	RA22120	\N	\N	acier	22x120
8038	Rivet Brut 22x130	RB22130	\N	\N	none	22x130
8039	Rivet Zingué 22x130	RZ22130	\N	\N	cold	22x130
8040	Rivet Zingué à chaud 22x130	RZC22130	\N	\N	hot	22x130
8041	Rivet Acier 22x130	RA22130	\N	\N	acier	22x130
8042	Rivet Brut 22x140	RB22140	\N	\N	none	22x140
8043	Rivet Zingué 22x140	RZ22140	\N	\N	cold	22x140
8044	Rivet Zingué à chaud 22x140	RZC22140	\N	\N	hot	22x140
8045	Rivet Acier 22x140	RA22140	\N	\N	acier	22x140
8046	Rivet Brut 22x150	RB22150	\N	\N	none	22x150
8047	Rivet Zingué 22x150	RZ22150	\N	\N	cold	22x150
8048	Rivet Zingué à chaud 22x150	RZC22150	\N	\N	hot	22x150
8049	Rivet Acier 22x150	RA22150	\N	\N	acier	22x150
8050	Rivet Brut 22x160	RB22160	\N	\N	none	22x160
8051	Rivet Zingué 22x160	RZ22160	\N	\N	cold	22x160
8052	Rivet Zingué à chaud 22x160	RZC22160	\N	\N	hot	22x160
8053	Rivet Acier 22x160	RA22160	\N	\N	acier	22x160
8054	Rivet Brut 22x170	RB22170	\N	\N	none	22x170
8055	Rivet Zingué 22x170	RZ22170	\N	\N	cold	22x170
8056	Rivet Zingué à chaud 22x170	RZC22170	\N	\N	hot	22x170
8057	Rivet Acier 22x170	RA22170	\N	\N	acier	22x170
8058	Rivet Brut 22x180	RB22180	\N	\N	none	22x180
8059	Rivet Zingué 22x180	RZ22180	\N	\N	cold	22x180
8060	Rivet Zingué à chaud 22x180	RZC22180	\N	\N	hot	22x180
8061	Rivet Acier 22x180	RA22180	\N	\N	acier	22x180
8062	Rivet Brut 22x190	RB22190	\N	\N	none	22x190
8063	Rivet Zingué 22x190	RZ22190	\N	\N	cold	22x190
8064	Rivet Zingué à chaud 22x190	RZC22190	\N	\N	hot	22x190
8065	Rivet Acier 22x190	RA22190	\N	\N	acier	22x190
8066	Rivet Brut 22x200	RB22200	\N	\N	none	22x200
8067	Rivet Zingué 22x200	RZ22200	\N	\N	cold	22x200
8068	Rivet Zingué à chaud 22x200	RZC22200	\N	\N	hot	22x200
8069	Rivet Acier 22x200	RA22200	\N	\N	acier	22x200
8070	Rivet Brut 24x12	RB2412	\N	\N	none	24x12
8071	Rivet Zingué 24x12	RZ2412	\N	\N	cold	24x12
8072	Rivet Zingué à chaud 24x12	RZC2412	\N	\N	hot	24x12
8073	Rivet Acier 24x12	RA2412	\N	\N	acier	24x12
8074	Rivet Brut 24x16	RB2416	\N	\N	none	24x16
8075	Rivet Zingué 24x16	RZ2416	\N	\N	cold	24x16
8076	Rivet Zingué à chaud 24x16	RZC2416	\N	\N	hot	24x16
8077	Rivet Acier 24x16	RA2416	\N	\N	acier	24x16
8078	Rivet Brut 24x20	RB2420	\N	\N	none	24x20
8079	Rivet Zingué 24x20	RZ2420	\N	\N	cold	24x20
8080	Rivet Zingué à chaud 24x20	RZC2420	\N	\N	hot	24x20
8081	Rivet Acier 24x20	RA2420	\N	\N	acier	24x20
8082	Rivet Brut 24x25	RB2425	\N	\N	none	24x25
8083	Rivet Zingué 24x25	RZ2425	\N	\N	cold	24x25
8084	Rivet Zingué à chaud 24x25	RZC2425	\N	\N	hot	24x25
8085	Rivet Acier 24x25	RA2425	\N	\N	acier	24x25
8086	Rivet Brut 24x30	RB2430	\N	\N	none	24x30
8087	Rivet Zingué 24x30	RZ2430	\N	\N	cold	24x30
8088	Rivet Zingué à chaud 24x30	RZC2430	\N	\N	hot	24x30
8089	Rivet Acier 24x30	RA2430	\N	\N	acier	24x30
8090	Rivet Brut 24x35	RB2435	\N	\N	none	24x35
8091	Rivet Zingué 24x35	RZ2435	\N	\N	cold	24x35
8092	Rivet Zingué à chaud 24x35	RZC2435	\N	\N	hot	24x35
8093	Rivet Acier 24x35	RA2435	\N	\N	acier	24x35
8094	Rivet Brut 24x40	RB2440	\N	\N	none	24x40
8095	Rivet Zingué 24x40	RZ2440	\N	\N	cold	24x40
8096	Rivet Zingué à chaud 24x40	RZC2440	\N	\N	hot	24x40
8097	Rivet Acier 24x40	RA2440	\N	\N	acier	24x40
8098	Rivet Brut 24x45	RB2445	\N	\N	none	24x45
8099	Rivet Zingué 24x45	RZ2445	\N	\N	cold	24x45
8100	Rivet Zingué à chaud 24x45	RZC2445	\N	\N	hot	24x45
8101	Rivet Acier 24x45	RA2445	\N	\N	acier	24x45
8102	Rivet Brut 24x50	RB2450	\N	\N	none	24x50
8103	Rivet Zingué 24x50	RZ2450	\N	\N	cold	24x50
8104	Rivet Zingué à chaud 24x50	RZC2450	\N	\N	hot	24x50
8105	Rivet Acier 24x50	RA2450	\N	\N	acier	24x50
8106	Rivet Brut 24x55	RB2455	\N	\N	none	24x55
8107	Rivet Zingué 24x55	RZ2455	\N	\N	cold	24x55
8108	Rivet Zingué à chaud 24x55	RZC2455	\N	\N	hot	24x55
8109	Rivet Acier 24x55	RA2455	\N	\N	acier	24x55
8110	Rivet Brut 24x60	RB2460	\N	\N	none	24x60
8111	Rivet Zingué 24x60	RZ2460	\N	\N	cold	24x60
8112	Rivet Zingué à chaud 24x60	RZC2460	\N	\N	hot	24x60
8113	Rivet Acier 24x60	RA2460	\N	\N	acier	24x60
8114	Rivet Brut 24x65	RB2465	\N	\N	none	24x65
8115	Rivet Zingué 24x65	RZ2465	\N	\N	cold	24x65
8116	Rivet Zingué à chaud 24x65	RZC2465	\N	\N	hot	24x65
8117	Rivet Acier 24x65	RA2465	\N	\N	acier	24x65
8118	Rivet Brut 24x70	RB2470	\N	\N	none	24x70
8119	Rivet Zingué 24x70	RZ2470	\N	\N	cold	24x70
8120	Rivet Zingué à chaud 24x70	RZC2470	\N	\N	hot	24x70
8121	Rivet Acier 24x70	RA2470	\N	\N	acier	24x70
8122	Rivet Brut 24x75	RB2475	\N	\N	none	24x75
8123	Rivet Zingué 24x75	RZ2475	\N	\N	cold	24x75
8124	Rivet Zingué à chaud 24x75	RZC2475	\N	\N	hot	24x75
8125	Rivet Acier 24x75	RA2475	\N	\N	acier	24x75
8126	Rivet Brut 24x80	RB2480	\N	\N	none	24x80
8127	Rivet Zingué 24x80	RZ2480	\N	\N	cold	24x80
8128	Rivet Zingué à chaud 24x80	RZC2480	\N	\N	hot	24x80
8129	Rivet Acier 24x80	RA2480	\N	\N	acier	24x80
8130	Rivet Brut 24x85	RB2485	\N	\N	none	24x85
8131	Rivet Zingué 24x85	RZ2485	\N	\N	cold	24x85
8132	Rivet Zingué à chaud 24x85	RZC2485	\N	\N	hot	24x85
8133	Rivet Acier 24x85	RA2485	\N	\N	acier	24x85
8134	Rivet Brut 24x90	RB2490	\N	\N	none	24x90
8135	Rivet Zingué 24x90	RZ2490	\N	\N	cold	24x90
8136	Rivet Zingué à chaud 24x90	RZC2490	\N	\N	hot	24x90
8137	Rivet Acier 24x90	RA2490	\N	\N	acier	24x90
8138	Rivet Brut 24x100	RB24100	\N	\N	none	24x100
8139	Rivet Zingué 24x100	RZ24100	\N	\N	cold	24x100
8140	Rivet Zingué à chaud 24x100	RZC24100	\N	\N	hot	24x100
8141	Rivet Acier 24x100	RA24100	\N	\N	acier	24x100
8142	Rivet Brut 24x110	RB24110	\N	\N	none	24x110
8143	Rivet Zingué 24x110	RZ24110	\N	\N	cold	24x110
8144	Rivet Zingué à chaud 24x110	RZC24110	\N	\N	hot	24x110
8145	Rivet Acier 24x110	RA24110	\N	\N	acier	24x110
8146	Rivet Brut 24x120	RB24120	\N	\N	none	24x120
8147	Rivet Zingué 24x120	RZ24120	\N	\N	cold	24x120
8148	Rivet Zingué à chaud 24x120	RZC24120	\N	\N	hot	24x120
8149	Rivet Acier 24x120	RA24120	\N	\N	acier	24x120
8150	Rivet Brut 24x130	RB24130	\N	\N	none	24x130
8151	Rivet Zingué 24x130	RZ24130	\N	\N	cold	24x130
8152	Rivet Zingué à chaud 24x130	RZC24130	\N	\N	hot	24x130
8153	Rivet Acier 24x130	RA24130	\N	\N	acier	24x130
8154	Rivet Brut 24x140	RB24140	\N	\N	none	24x140
8155	Rivet Zingué 24x140	RZ24140	\N	\N	cold	24x140
8156	Rivet Zingué à chaud 24x140	RZC24140	\N	\N	hot	24x140
8157	Rivet Acier 24x140	RA24140	\N	\N	acier	24x140
8158	Rivet Brut 24x150	RB24150	\N	\N	none	24x150
8159	Rivet Zingué 24x150	RZ24150	\N	\N	cold	24x150
8160	Rivet Zingué à chaud 24x150	RZC24150	\N	\N	hot	24x150
8161	Rivet Acier 24x150	RA24150	\N	\N	acier	24x150
8162	Rivet Brut 24x160	RB24160	\N	\N	none	24x160
8163	Rivet Zingué 24x160	RZ24160	\N	\N	cold	24x160
8164	Rivet Zingué à chaud 24x160	RZC24160	\N	\N	hot	24x160
8165	Rivet Acier 24x160	RA24160	\N	\N	acier	24x160
8166	Rivet Brut 24x170	RB24170	\N	\N	none	24x170
8167	Rivet Zingué 24x170	RZ24170	\N	\N	cold	24x170
8168	Rivet Zingué à chaud 24x170	RZC24170	\N	\N	hot	24x170
8169	Rivet Acier 24x170	RA24170	\N	\N	acier	24x170
8170	Rivet Brut 24x180	RB24180	\N	\N	none	24x180
8171	Rivet Zingué 24x180	RZ24180	\N	\N	cold	24x180
8172	Rivet Zingué à chaud 24x180	RZC24180	\N	\N	hot	24x180
8173	Rivet Acier 24x180	RA24180	\N	\N	acier	24x180
8174	Rivet Brut 24x190	RB24190	\N	\N	none	24x190
8175	Rivet Zingué 24x190	RZ24190	\N	\N	cold	24x190
8176	Rivet Zingué à chaud 24x190	RZC24190	\N	\N	hot	24x190
8177	Rivet Acier 24x190	RA24190	\N	\N	acier	24x190
8178	Rivet Brut 24x200	RB24200	\N	\N	none	24x200
8179	Rivet Zingué 24x200	RZ24200	\N	\N	cold	24x200
8180	Rivet Zingué à chaud 24x200	RZC24200	\N	\N	hot	24x200
8181	Rivet Acier 24x200	RA24200	\N	\N	acier	24x200
8182	Rivet Brut 27x12	RB2712	\N	\N	none	27x12
8183	Rivet Zingué 27x12	RZ2712	\N	\N	cold	27x12
8184	Rivet Zingué à chaud 27x12	RZC2712	\N	\N	hot	27x12
8185	Rivet Acier 27x12	RA2712	\N	\N	acier	27x12
8186	Rivet Brut 27x16	RB2716	\N	\N	none	27x16
8187	Rivet Zingué 27x16	RZ2716	\N	\N	cold	27x16
8188	Rivet Zingué à chaud 27x16	RZC2716	\N	\N	hot	27x16
8189	Rivet Acier 27x16	RA2716	\N	\N	acier	27x16
8190	Rivet Brut 27x20	RB2720	\N	\N	none	27x20
8191	Rivet Zingué 27x20	RZ2720	\N	\N	cold	27x20
8192	Rivet Zingué à chaud 27x20	RZC2720	\N	\N	hot	27x20
8193	Rivet Acier 27x20	RA2720	\N	\N	acier	27x20
8194	Rivet Brut 27x25	RB2725	\N	\N	none	27x25
8195	Rivet Zingué 27x25	RZ2725	\N	\N	cold	27x25
8196	Rivet Zingué à chaud 27x25	RZC2725	\N	\N	hot	27x25
8197	Rivet Acier 27x25	RA2725	\N	\N	acier	27x25
8198	Rivet Brut 27x30	RB2730	\N	\N	none	27x30
8199	Rivet Zingué 27x30	RZ2730	\N	\N	cold	27x30
8200	Rivet Zingué à chaud 27x30	RZC2730	\N	\N	hot	27x30
8201	Rivet Acier 27x30	RA2730	\N	\N	acier	27x30
8202	Rivet Brut 27x35	RB2735	\N	\N	none	27x35
8203	Rivet Zingué 27x35	RZ2735	\N	\N	cold	27x35
8204	Rivet Zingué à chaud 27x35	RZC2735	\N	\N	hot	27x35
8205	Rivet Acier 27x35	RA2735	\N	\N	acier	27x35
8206	Rivet Brut 27x40	RB2740	\N	\N	none	27x40
8207	Rivet Zingué 27x40	RZ2740	\N	\N	cold	27x40
8208	Rivet Zingué à chaud 27x40	RZC2740	\N	\N	hot	27x40
8209	Rivet Acier 27x40	RA2740	\N	\N	acier	27x40
8210	Rivet Brut 27x45	RB2745	\N	\N	none	27x45
8211	Rivet Zingué 27x45	RZ2745	\N	\N	cold	27x45
8212	Rivet Zingué à chaud 27x45	RZC2745	\N	\N	hot	27x45
8213	Rivet Acier 27x45	RA2745	\N	\N	acier	27x45
8214	Rivet Brut 27x50	RB2750	\N	\N	none	27x50
8215	Rivet Zingué 27x50	RZ2750	\N	\N	cold	27x50
8216	Rivet Zingué à chaud 27x50	RZC2750	\N	\N	hot	27x50
8217	Rivet Acier 27x50	RA2750	\N	\N	acier	27x50
8218	Rivet Brut 27x55	RB2755	\N	\N	none	27x55
8219	Rivet Zingué 27x55	RZ2755	\N	\N	cold	27x55
8220	Rivet Zingué à chaud 27x55	RZC2755	\N	\N	hot	27x55
8221	Rivet Acier 27x55	RA2755	\N	\N	acier	27x55
8222	Rivet Brut 27x60	RB2760	\N	\N	none	27x60
8223	Rivet Zingué 27x60	RZ2760	\N	\N	cold	27x60
8224	Rivet Zingué à chaud 27x60	RZC2760	\N	\N	hot	27x60
8225	Rivet Acier 27x60	RA2760	\N	\N	acier	27x60
8226	Rivet Brut 27x65	RB2765	\N	\N	none	27x65
8227	Rivet Zingué 27x65	RZ2765	\N	\N	cold	27x65
8228	Rivet Zingué à chaud 27x65	RZC2765	\N	\N	hot	27x65
8229	Rivet Acier 27x65	RA2765	\N	\N	acier	27x65
8230	Rivet Brut 27x70	RB2770	\N	\N	none	27x70
8231	Rivet Zingué 27x70	RZ2770	\N	\N	cold	27x70
8232	Rivet Zingué à chaud 27x70	RZC2770	\N	\N	hot	27x70
8233	Rivet Acier 27x70	RA2770	\N	\N	acier	27x70
8234	Rivet Brut 27x75	RB2775	\N	\N	none	27x75
8235	Rivet Zingué 27x75	RZ2775	\N	\N	cold	27x75
8236	Rivet Zingué à chaud 27x75	RZC2775	\N	\N	hot	27x75
8237	Rivet Acier 27x75	RA2775	\N	\N	acier	27x75
8238	Rivet Brut 27x80	RB2780	\N	\N	none	27x80
8239	Rivet Zingué 27x80	RZ2780	\N	\N	cold	27x80
8240	Rivet Zingué à chaud 27x80	RZC2780	\N	\N	hot	27x80
8241	Rivet Acier 27x80	RA2780	\N	\N	acier	27x80
8242	Rivet Brut 27x85	RB2785	\N	\N	none	27x85
8243	Rivet Zingué 27x85	RZ2785	\N	\N	cold	27x85
8244	Rivet Zingué à chaud 27x85	RZC2785	\N	\N	hot	27x85
8245	Rivet Acier 27x85	RA2785	\N	\N	acier	27x85
8246	Rivet Brut 27x90	RB2790	\N	\N	none	27x90
8247	Rivet Zingué 27x90	RZ2790	\N	\N	cold	27x90
8248	Rivet Zingué à chaud 27x90	RZC2790	\N	\N	hot	27x90
8249	Rivet Acier 27x90	RA2790	\N	\N	acier	27x90
8250	Rivet Brut 27x100	RB27100	\N	\N	none	27x100
8251	Rivet Zingué 27x100	RZ27100	\N	\N	cold	27x100
8252	Rivet Zingué à chaud 27x100	RZC27100	\N	\N	hot	27x100
8253	Rivet Acier 27x100	RA27100	\N	\N	acier	27x100
8254	Rivet Brut 27x110	RB27110	\N	\N	none	27x110
8255	Rivet Zingué 27x110	RZ27110	\N	\N	cold	27x110
8256	Rivet Zingué à chaud 27x110	RZC27110	\N	\N	hot	27x110
8257	Rivet Acier 27x110	RA27110	\N	\N	acier	27x110
8258	Rivet Brut 27x120	RB27120	\N	\N	none	27x120
8259	Rivet Zingué 27x120	RZ27120	\N	\N	cold	27x120
8260	Rivet Zingué à chaud 27x120	RZC27120	\N	\N	hot	27x120
8261	Rivet Acier 27x120	RA27120	\N	\N	acier	27x120
8262	Rivet Brut 27x130	RB27130	\N	\N	none	27x130
8263	Rivet Zingué 27x130	RZ27130	\N	\N	cold	27x130
8264	Rivet Zingué à chaud 27x130	RZC27130	\N	\N	hot	27x130
8265	Rivet Acier 27x130	RA27130	\N	\N	acier	27x130
8266	Rivet Brut 27x140	RB27140	\N	\N	none	27x140
8267	Rivet Zingué 27x140	RZ27140	\N	\N	cold	27x140
8268	Rivet Zingué à chaud 27x140	RZC27140	\N	\N	hot	27x140
8269	Rivet Acier 27x140	RA27140	\N	\N	acier	27x140
8270	Rivet Brut 27x150	RB27150	\N	\N	none	27x150
8271	Rivet Zingué 27x150	RZ27150	\N	\N	cold	27x150
8272	Rivet Zingué à chaud 27x150	RZC27150	\N	\N	hot	27x150
8273	Rivet Acier 27x150	RA27150	\N	\N	acier	27x150
8274	Rivet Brut 27x160	RB27160	\N	\N	none	27x160
8275	Rivet Zingué 27x160	RZ27160	\N	\N	cold	27x160
8276	Rivet Zingué à chaud 27x160	RZC27160	\N	\N	hot	27x160
8277	Rivet Acier 27x160	RA27160	\N	\N	acier	27x160
8278	Rivet Brut 27x170	RB27170	\N	\N	none	27x170
8279	Rivet Zingué 27x170	RZ27170	\N	\N	cold	27x170
8280	Rivet Zingué à chaud 27x170	RZC27170	\N	\N	hot	27x170
8281	Rivet Acier 27x170	RA27170	\N	\N	acier	27x170
8282	Rivet Brut 27x180	RB27180	\N	\N	none	27x180
8283	Rivet Zingué 27x180	RZ27180	\N	\N	cold	27x180
8284	Rivet Zingué à chaud 27x180	RZC27180	\N	\N	hot	27x180
8285	Rivet Acier 27x180	RA27180	\N	\N	acier	27x180
8286	Rivet Brut 27x190	RB27190	\N	\N	none	27x190
8287	Rivet Zingué 27x190	RZ27190	\N	\N	cold	27x190
8288	Rivet Zingué à chaud 27x190	RZC27190	\N	\N	hot	27x190
8289	Rivet Acier 27x190	RA27190	\N	\N	acier	27x190
8290	Rivet Brut 27x200	RB27200	\N	\N	none	27x200
8291	Rivet Zingué 27x200	RZ27200	\N	\N	cold	27x200
8292	Rivet Zingué à chaud 27x200	RZC27200	\N	\N	hot	27x200
8293	Rivet Acier 27x200	RA27200	\N	\N	acier	27x200
8294	Rivet Brut 30x12	RB3012	\N	\N	none	30x12
8295	Rivet Zingué 30x12	RZ3012	\N	\N	cold	30x12
8296	Rivet Zingué à chaud 30x12	RZC3012	\N	\N	hot	30x12
8297	Rivet Acier 30x12	RA3012	\N	\N	acier	30x12
8298	Rivet Brut 30x16	RB3016	\N	\N	none	30x16
8299	Rivet Zingué 30x16	RZ3016	\N	\N	cold	30x16
8300	Rivet Zingué à chaud 30x16	RZC3016	\N	\N	hot	30x16
8301	Rivet Acier 30x16	RA3016	\N	\N	acier	30x16
8302	Rivet Brut 30x20	RB3020	\N	\N	none	30x20
8303	Rivet Zingué 30x20	RZ3020	\N	\N	cold	30x20
8304	Rivet Zingué à chaud 30x20	RZC3020	\N	\N	hot	30x20
8305	Rivet Acier 30x20	RA3020	\N	\N	acier	30x20
8306	Rivet Brut 30x25	RB3025	\N	\N	none	30x25
8307	Rivet Zingué 30x25	RZ3025	\N	\N	cold	30x25
8308	Rivet Zingué à chaud 30x25	RZC3025	\N	\N	hot	30x25
8309	Rivet Acier 30x25	RA3025	\N	\N	acier	30x25
8310	Rivet Brut 30x30	RB3030	\N	\N	none	30x30
8311	Rivet Zingué 30x30	RZ3030	\N	\N	cold	30x30
8312	Rivet Zingué à chaud 30x30	RZC3030	\N	\N	hot	30x30
8313	Rivet Acier 30x30	RA3030	\N	\N	acier	30x30
8314	Rivet Brut 30x35	RB3035	\N	\N	none	30x35
8315	Rivet Zingué 30x35	RZ3035	\N	\N	cold	30x35
8316	Rivet Zingué à chaud 30x35	RZC3035	\N	\N	hot	30x35
8317	Rivet Acier 30x35	RA3035	\N	\N	acier	30x35
8318	Rivet Brut 30x40	RB3040	\N	\N	none	30x40
8319	Rivet Zingué 30x40	RZ3040	\N	\N	cold	30x40
8320	Rivet Zingué à chaud 30x40	RZC3040	\N	\N	hot	30x40
8321	Rivet Acier 30x40	RA3040	\N	\N	acier	30x40
8322	Rivet Brut 30x45	RB3045	\N	\N	none	30x45
8323	Rivet Zingué 30x45	RZ3045	\N	\N	cold	30x45
8324	Rivet Zingué à chaud 30x45	RZC3045	\N	\N	hot	30x45
8325	Rivet Acier 30x45	RA3045	\N	\N	acier	30x45
8326	Rivet Brut 30x50	RB3050	\N	\N	none	30x50
8327	Rivet Zingué 30x50	RZ3050	\N	\N	cold	30x50
8328	Rivet Zingué à chaud 30x50	RZC3050	\N	\N	hot	30x50
8329	Rivet Acier 30x50	RA3050	\N	\N	acier	30x50
8330	Rivet Brut 30x55	RB3055	\N	\N	none	30x55
8331	Rivet Zingué 30x55	RZ3055	\N	\N	cold	30x55
8332	Rivet Zingué à chaud 30x55	RZC3055	\N	\N	hot	30x55
8333	Rivet Acier 30x55	RA3055	\N	\N	acier	30x55
8334	Rivet Brut 30x60	RB3060	\N	\N	none	30x60
8335	Rivet Zingué 30x60	RZ3060	\N	\N	cold	30x60
8336	Rivet Zingué à chaud 30x60	RZC3060	\N	\N	hot	30x60
8337	Rivet Acier 30x60	RA3060	\N	\N	acier	30x60
8338	Rivet Brut 30x65	RB3065	\N	\N	none	30x65
8339	Rivet Zingué 30x65	RZ3065	\N	\N	cold	30x65
8340	Rivet Zingué à chaud 30x65	RZC3065	\N	\N	hot	30x65
8341	Rivet Acier 30x65	RA3065	\N	\N	acier	30x65
8342	Rivet Brut 30x70	RB3070	\N	\N	none	30x70
8343	Rivet Zingué 30x70	RZ3070	\N	\N	cold	30x70
8344	Rivet Zingué à chaud 30x70	RZC3070	\N	\N	hot	30x70
8345	Rivet Acier 30x70	RA3070	\N	\N	acier	30x70
8346	Rivet Brut 30x75	RB3075	\N	\N	none	30x75
8347	Rivet Zingué 30x75	RZ3075	\N	\N	cold	30x75
8348	Rivet Zingué à chaud 30x75	RZC3075	\N	\N	hot	30x75
8349	Rivet Acier 30x75	RA3075	\N	\N	acier	30x75
8350	Rivet Brut 30x80	RB3080	\N	\N	none	30x80
8351	Rivet Zingué 30x80	RZ3080	\N	\N	cold	30x80
8352	Rivet Zingué à chaud 30x80	RZC3080	\N	\N	hot	30x80
8353	Rivet Acier 30x80	RA3080	\N	\N	acier	30x80
8354	Rivet Brut 30x85	RB3085	\N	\N	none	30x85
8355	Rivet Zingué 30x85	RZ3085	\N	\N	cold	30x85
8356	Rivet Zingué à chaud 30x85	RZC3085	\N	\N	hot	30x85
8357	Rivet Acier 30x85	RA3085	\N	\N	acier	30x85
8358	Rivet Brut 30x90	RB3090	\N	\N	none	30x90
8359	Rivet Zingué 30x90	RZ3090	\N	\N	cold	30x90
8360	Rivet Zingué à chaud 30x90	RZC3090	\N	\N	hot	30x90
8361	Rivet Acier 30x90	RA3090	\N	\N	acier	30x90
8362	Rivet Brut 30x100	RB30100	\N	\N	none	30x100
8363	Rivet Zingué 30x100	RZ30100	\N	\N	cold	30x100
8364	Rivet Zingué à chaud 30x100	RZC30100	\N	\N	hot	30x100
8365	Rivet Acier 30x100	RA30100	\N	\N	acier	30x100
8366	Rivet Brut 30x110	RB30110	\N	\N	none	30x110
8367	Rivet Zingué 30x110	RZ30110	\N	\N	cold	30x110
8368	Rivet Zingué à chaud 30x110	RZC30110	\N	\N	hot	30x110
8369	Rivet Acier 30x110	RA30110	\N	\N	acier	30x110
8370	Rivet Brut 30x120	RB30120	\N	\N	none	30x120
8371	Rivet Zingué 30x120	RZ30120	\N	\N	cold	30x120
8372	Rivet Zingué à chaud 30x120	RZC30120	\N	\N	hot	30x120
8373	Rivet Acier 30x120	RA30120	\N	\N	acier	30x120
8374	Rivet Brut 30x130	RB30130	\N	\N	none	30x130
8375	Rivet Zingué 30x130	RZ30130	\N	\N	cold	30x130
8376	Rivet Zingué à chaud 30x130	RZC30130	\N	\N	hot	30x130
8377	Rivet Acier 30x130	RA30130	\N	\N	acier	30x130
8378	Rivet Brut 30x140	RB30140	\N	\N	none	30x140
8379	Rivet Zingué 30x140	RZ30140	\N	\N	cold	30x140
8380	Rivet Zingué à chaud 30x140	RZC30140	\N	\N	hot	30x140
8381	Rivet Acier 30x140	RA30140	\N	\N	acier	30x140
8382	Rivet Brut 30x150	RB30150	\N	\N	none	30x150
8383	Rivet Zingué 30x150	RZ30150	\N	\N	cold	30x150
8384	Rivet Zingué à chaud 30x150	RZC30150	\N	\N	hot	30x150
8385	Rivet Acier 30x150	RA30150	\N	\N	acier	30x150
8386	Rivet Brut 30x160	RB30160	\N	\N	none	30x160
8387	Rivet Zingué 30x160	RZ30160	\N	\N	cold	30x160
8388	Rivet Zingué à chaud 30x160	RZC30160	\N	\N	hot	30x160
8389	Rivet Acier 30x160	RA30160	\N	\N	acier	30x160
8390	Rivet Brut 30x170	RB30170	\N	\N	none	30x170
8391	Rivet Zingué 30x170	RZ30170	\N	\N	cold	30x170
8392	Rivet Zingué à chaud 30x170	RZC30170	\N	\N	hot	30x170
8393	Rivet Acier 30x170	RA30170	\N	\N	acier	30x170
8394	Rivet Brut 30x180	RB30180	\N	\N	none	30x180
8395	Rivet Zingué 30x180	RZ30180	\N	\N	cold	30x180
8396	Rivet Zingué à chaud 30x180	RZC30180	\N	\N	hot	30x180
8397	Rivet Acier 30x180	RA30180	\N	\N	acier	30x180
8398	Rivet Brut 30x190	RB30190	\N	\N	none	30x190
8399	Rivet Zingué 30x190	RZ30190	\N	\N	cold	30x190
8400	Rivet Zingué à chaud 30x190	RZC30190	\N	\N	hot	30x190
8401	Rivet Acier 30x190	RA30190	\N	\N	acier	30x190
8402	Rivet Brut 30x200	RB30200	\N	\N	none	30x200
8403	Rivet Zingué 30x200	RZ30200	\N	\N	cold	30x200
8404	Rivet Zingué à chaud 30x200	RZC30200	\N	\N	hot	30x200
8405	Rivet Acier 30x200	RA30200	\N	\N	acier	30x200
10913	Boulon Brut 4x12	BB412	\N	\N	none	4x12
10914	Boulon Zingué 4x12	BZ412	\N	\N	cold	4x12
10915	Boulon Zingué à chaud 4x12	BZC412	\N	\N	hot	4x12
10916	Boulon Acier 4x12	BA412	\N	\N	acier	4x12
10917	Boulon Brut 4x16	BB416	\N	\N	none	4x16
10918	Boulon Zingué 4x16	BZ416	\N	\N	cold	4x16
10919	Boulon Zingué à chaud 4x16	BZC416	\N	\N	hot	4x16
10920	Boulon Acier 4x16	BA416	\N	\N	acier	4x16
10921	Boulon Brut 4x20	BB420	\N	\N	none	4x20
10922	Boulon Zingué 4x20	BZ420	\N	\N	cold	4x20
10923	Boulon Zingué à chaud 4x20	BZC420	\N	\N	hot	4x20
10924	Boulon Acier 4x20	BA420	\N	\N	acier	4x20
10925	Boulon Brut 4x25	BB425	\N	\N	none	4x25
10926	Boulon Zingué 4x25	BZ425	\N	\N	cold	4x25
10927	Boulon Zingué à chaud 4x25	BZC425	\N	\N	hot	4x25
10928	Boulon Acier 4x25	BA425	\N	\N	acier	4x25
10929	Boulon Brut 4x30	BB430	\N	\N	none	4x30
10930	Boulon Zingué 4x30	BZ430	\N	\N	cold	4x30
10931	Boulon Zingué à chaud 4x30	BZC430	\N	\N	hot	4x30
10932	Boulon Acier 4x30	BA430	\N	\N	acier	4x30
10933	Boulon Brut 4x35	BB435	\N	\N	none	4x35
10934	Boulon Zingué 4x35	BZ435	\N	\N	cold	4x35
10935	Boulon Zingué à chaud 4x35	BZC435	\N	\N	hot	4x35
10936	Boulon Acier 4x35	BA435	\N	\N	acier	4x35
10937	Boulon Brut 4x40	BB440	\N	\N	none	4x40
10938	Boulon Zingué 4x40	BZ440	\N	\N	cold	4x40
10939	Boulon Zingué à chaud 4x40	BZC440	\N	\N	hot	4x40
10940	Boulon Acier 4x40	BA440	\N	\N	acier	4x40
10941	Boulon Brut 4x45	BB445	\N	\N	none	4x45
10942	Boulon Zingué 4x45	BZ445	\N	\N	cold	4x45
10943	Boulon Zingué à chaud 4x45	BZC445	\N	\N	hot	4x45
10944	Boulon Acier 4x45	BA445	\N	\N	acier	4x45
10945	Boulon Brut 4x50	BB450	\N	\N	none	4x50
10946	Boulon Zingué 4x50	BZ450	\N	\N	cold	4x50
10947	Boulon Zingué à chaud 4x50	BZC450	\N	\N	hot	4x50
10948	Boulon Acier 4x50	BA450	\N	\N	acier	4x50
10949	Boulon Brut 4x55	BB455	\N	\N	none	4x55
10950	Boulon Zingué 4x55	BZ455	\N	\N	cold	4x55
10951	Boulon Zingué à chaud 4x55	BZC455	\N	\N	hot	4x55
10952	Boulon Acier 4x55	BA455	\N	\N	acier	4x55
10953	Boulon Brut 4x60	BB460	\N	\N	none	4x60
10954	Boulon Zingué 4x60	BZ460	\N	\N	cold	4x60
10955	Boulon Zingué à chaud 4x60	BZC460	\N	\N	hot	4x60
10956	Boulon Acier 4x60	BA460	\N	\N	acier	4x60
10957	Boulon Brut 4x65	BB465	\N	\N	none	4x65
10958	Boulon Zingué 4x65	BZ465	\N	\N	cold	4x65
10959	Boulon Zingué à chaud 4x65	BZC465	\N	\N	hot	4x65
10960	Boulon Acier 4x65	BA465	\N	\N	acier	4x65
10961	Boulon Brut 4x70	BB470	\N	\N	none	4x70
10962	Boulon Zingué 4x70	BZ470	\N	\N	cold	4x70
10963	Boulon Zingué à chaud 4x70	BZC470	\N	\N	hot	4x70
10964	Boulon Acier 4x70	BA470	\N	\N	acier	4x70
10965	Boulon Brut 4x75	BB475	\N	\N	none	4x75
10966	Boulon Zingué 4x75	BZ475	\N	\N	cold	4x75
10967	Boulon Zingué à chaud 4x75	BZC475	\N	\N	hot	4x75
10968	Boulon Acier 4x75	BA475	\N	\N	acier	4x75
10969	Boulon Brut 4x80	BB480	\N	\N	none	4x80
10970	Boulon Zingué 4x80	BZ480	\N	\N	cold	4x80
10971	Boulon Zingué à chaud 4x80	BZC480	\N	\N	hot	4x80
10972	Boulon Acier 4x80	BA480	\N	\N	acier	4x80
10973	Boulon Brut 4x85	BB485	\N	\N	none	4x85
10974	Boulon Zingué 4x85	BZ485	\N	\N	cold	4x85
10975	Boulon Zingué à chaud 4x85	BZC485	\N	\N	hot	4x85
10976	Boulon Acier 4x85	BA485	\N	\N	acier	4x85
10977	Boulon Brut 4x90	BB490	\N	\N	none	4x90
10978	Boulon Zingué 4x90	BZ490	\N	\N	cold	4x90
10979	Boulon Zingué à chaud 4x90	BZC490	\N	\N	hot	4x90
10980	Boulon Acier 4x90	BA490	\N	\N	acier	4x90
10981	Boulon Brut 4x100	BB4100	\N	\N	none	4x100
10982	Boulon Zingué 4x100	BZ4100	\N	\N	cold	4x100
10983	Boulon Zingué à chaud 4x100	BZC4100	\N	\N	hot	4x100
10984	Boulon Acier 4x100	BA4100	\N	\N	acier	4x100
10985	Boulon Brut 4x110	BB4110	\N	\N	none	4x110
10986	Boulon Zingué 4x110	BZ4110	\N	\N	cold	4x110
10987	Boulon Zingué à chaud 4x110	BZC4110	\N	\N	hot	4x110
10988	Boulon Acier 4x110	BA4110	\N	\N	acier	4x110
10989	Boulon Brut 4x120	BB4120	\N	\N	none	4x120
10990	Boulon Zingué 4x120	BZ4120	\N	\N	cold	4x120
10991	Boulon Zingué à chaud 4x120	BZC4120	\N	\N	hot	4x120
10992	Boulon Acier 4x120	BA4120	\N	\N	acier	4x120
10993	Boulon Brut 4x130	BB4130	\N	\N	none	4x130
10994	Boulon Zingué 4x130	BZ4130	\N	\N	cold	4x130
10995	Boulon Zingué à chaud 4x130	BZC4130	\N	\N	hot	4x130
10996	Boulon Acier 4x130	BA4130	\N	\N	acier	4x130
10997	Boulon Brut 4x140	BB4140	\N	\N	none	4x140
10998	Boulon Zingué 4x140	BZ4140	\N	\N	cold	4x140
10999	Boulon Zingué à chaud 4x140	BZC4140	\N	\N	hot	4x140
11000	Boulon Acier 4x140	BA4140	\N	\N	acier	4x140
11001	Boulon Brut 4x150	BB4150	\N	\N	none	4x150
11002	Boulon Zingué 4x150	BZ4150	\N	\N	cold	4x150
11003	Boulon Zingué à chaud 4x150	BZC4150	\N	\N	hot	4x150
11004	Boulon Acier 4x150	BA4150	\N	\N	acier	4x150
11005	Boulon Brut 4x160	BB4160	\N	\N	none	4x160
11006	Boulon Zingué 4x160	BZ4160	\N	\N	cold	4x160
11007	Boulon Zingué à chaud 4x160	BZC4160	\N	\N	hot	4x160
11008	Boulon Acier 4x160	BA4160	\N	\N	acier	4x160
11009	Boulon Brut 4x170	BB4170	\N	\N	none	4x170
11010	Boulon Zingué 4x170	BZ4170	\N	\N	cold	4x170
11011	Boulon Zingué à chaud 4x170	BZC4170	\N	\N	hot	4x170
11012	Boulon Acier 4x170	BA4170	\N	\N	acier	4x170
11013	Boulon Brut 4x180	BB4180	\N	\N	none	4x180
11014	Boulon Zingué 4x180	BZ4180	\N	\N	cold	4x180
11015	Boulon Zingué à chaud 4x180	BZC4180	\N	\N	hot	4x180
11016	Boulon Acier 4x180	BA4180	\N	\N	acier	4x180
11017	Boulon Brut 4x190	BB4190	\N	\N	none	4x190
11018	Boulon Zingué 4x190	BZ4190	\N	\N	cold	4x190
11019	Boulon Zingué à chaud 4x190	BZC4190	\N	\N	hot	4x190
11020	Boulon Acier 4x190	BA4190	\N	\N	acier	4x190
11021	Boulon Brut 4x200	BB4200	\N	\N	none	4x200
11022	Boulon Zingué 4x200	BZ4200	\N	\N	cold	4x200
11023	Boulon Zingué à chaud 4x200	BZC4200	\N	\N	hot	4x200
11024	Boulon Acier 4x200	BA4200	\N	\N	acier	4x200
11025	Boulon Brut 5x12	BB512	\N	\N	none	5x12
11026	Boulon Zingué 5x12	BZ512	\N	\N	cold	5x12
11027	Boulon Zingué à chaud 5x12	BZC512	\N	\N	hot	5x12
11028	Boulon Acier 5x12	BA512	\N	\N	acier	5x12
11029	Boulon Brut 5x16	BB516	\N	\N	none	5x16
11030	Boulon Zingué 5x16	BZ516	\N	\N	cold	5x16
11031	Boulon Zingué à chaud 5x16	BZC516	\N	\N	hot	5x16
11032	Boulon Acier 5x16	BA516	\N	\N	acier	5x16
11033	Boulon Brut 5x20	BB520	\N	\N	none	5x20
11034	Boulon Zingué 5x20	BZ520	\N	\N	cold	5x20
11035	Boulon Zingué à chaud 5x20	BZC520	\N	\N	hot	5x20
11036	Boulon Acier 5x20	BA520	\N	\N	acier	5x20
11037	Boulon Brut 5x25	BB525	\N	\N	none	5x25
11038	Boulon Zingué 5x25	BZ525	\N	\N	cold	5x25
11039	Boulon Zingué à chaud 5x25	BZC525	\N	\N	hot	5x25
11040	Boulon Acier 5x25	BA525	\N	\N	acier	5x25
11041	Boulon Brut 5x30	BB530	\N	\N	none	5x30
11042	Boulon Zingué 5x30	BZ530	\N	\N	cold	5x30
11043	Boulon Zingué à chaud 5x30	BZC530	\N	\N	hot	5x30
11044	Boulon Acier 5x30	BA530	\N	\N	acier	5x30
11045	Boulon Brut 5x35	BB535	\N	\N	none	5x35
11046	Boulon Zingué 5x35	BZ535	\N	\N	cold	5x35
11047	Boulon Zingué à chaud 5x35	BZC535	\N	\N	hot	5x35
11048	Boulon Acier 5x35	BA535	\N	\N	acier	5x35
11049	Boulon Brut 5x40	BB540	\N	\N	none	5x40
11050	Boulon Zingué 5x40	BZ540	\N	\N	cold	5x40
11051	Boulon Zingué à chaud 5x40	BZC540	\N	\N	hot	5x40
11052	Boulon Acier 5x40	BA540	\N	\N	acier	5x40
11053	Boulon Brut 5x45	BB545	\N	\N	none	5x45
11054	Boulon Zingué 5x45	BZ545	\N	\N	cold	5x45
11055	Boulon Zingué à chaud 5x45	BZC545	\N	\N	hot	5x45
11056	Boulon Acier 5x45	BA545	\N	\N	acier	5x45
11057	Boulon Brut 5x50	BB550	\N	\N	none	5x50
11058	Boulon Zingué 5x50	BZ550	\N	\N	cold	5x50
11059	Boulon Zingué à chaud 5x50	BZC550	\N	\N	hot	5x50
11060	Boulon Acier 5x50	BA550	\N	\N	acier	5x50
11061	Boulon Brut 5x55	BB555	\N	\N	none	5x55
11062	Boulon Zingué 5x55	BZ555	\N	\N	cold	5x55
11063	Boulon Zingué à chaud 5x55	BZC555	\N	\N	hot	5x55
11064	Boulon Acier 5x55	BA555	\N	\N	acier	5x55
11065	Boulon Brut 5x60	BB560	\N	\N	none	5x60
11066	Boulon Zingué 5x60	BZ560	\N	\N	cold	5x60
11067	Boulon Zingué à chaud 5x60	BZC560	\N	\N	hot	5x60
11068	Boulon Acier 5x60	BA560	\N	\N	acier	5x60
11069	Boulon Brut 5x65	BB565	\N	\N	none	5x65
11070	Boulon Zingué 5x65	BZ565	\N	\N	cold	5x65
11071	Boulon Zingué à chaud 5x65	BZC565	\N	\N	hot	5x65
11072	Boulon Acier 5x65	BA565	\N	\N	acier	5x65
11073	Boulon Brut 5x70	BB570	\N	\N	none	5x70
11074	Boulon Zingué 5x70	BZ570	\N	\N	cold	5x70
11075	Boulon Zingué à chaud 5x70	BZC570	\N	\N	hot	5x70
11076	Boulon Acier 5x70	BA570	\N	\N	acier	5x70
11077	Boulon Brut 5x75	BB575	\N	\N	none	5x75
11078	Boulon Zingué 5x75	BZ575	\N	\N	cold	5x75
11079	Boulon Zingué à chaud 5x75	BZC575	\N	\N	hot	5x75
11080	Boulon Acier 5x75	BA575	\N	\N	acier	5x75
11081	Boulon Brut 5x80	BB580	\N	\N	none	5x80
11082	Boulon Zingué 5x80	BZ580	\N	\N	cold	5x80
11083	Boulon Zingué à chaud 5x80	BZC580	\N	\N	hot	5x80
11084	Boulon Acier 5x80	BA580	\N	\N	acier	5x80
11085	Boulon Brut 5x85	BB585	\N	\N	none	5x85
11086	Boulon Zingué 5x85	BZ585	\N	\N	cold	5x85
11087	Boulon Zingué à chaud 5x85	BZC585	\N	\N	hot	5x85
11088	Boulon Acier 5x85	BA585	\N	\N	acier	5x85
11089	Boulon Brut 5x90	BB590	\N	\N	none	5x90
11090	Boulon Zingué 5x90	BZ590	\N	\N	cold	5x90
11091	Boulon Zingué à chaud 5x90	BZC590	\N	\N	hot	5x90
11092	Boulon Acier 5x90	BA590	\N	\N	acier	5x90
11093	Boulon Brut 5x100	BB5100	\N	\N	none	5x100
11094	Boulon Zingué 5x100	BZ5100	\N	\N	cold	5x100
11095	Boulon Zingué à chaud 5x100	BZC5100	\N	\N	hot	5x100
11096	Boulon Acier 5x100	BA5100	\N	\N	acier	5x100
11097	Boulon Brut 5x110	BB5110	\N	\N	none	5x110
11098	Boulon Zingué 5x110	BZ5110	\N	\N	cold	5x110
11099	Boulon Zingué à chaud 5x110	BZC5110	\N	\N	hot	5x110
11100	Boulon Acier 5x110	BA5110	\N	\N	acier	5x110
11101	Boulon Brut 5x120	BB5120	\N	\N	none	5x120
11102	Boulon Zingué 5x120	BZ5120	\N	\N	cold	5x120
11103	Boulon Zingué à chaud 5x120	BZC5120	\N	\N	hot	5x120
11104	Boulon Acier 5x120	BA5120	\N	\N	acier	5x120
11105	Boulon Brut 5x130	BB5130	\N	\N	none	5x130
11106	Boulon Zingué 5x130	BZ5130	\N	\N	cold	5x130
11107	Boulon Zingué à chaud 5x130	BZC5130	\N	\N	hot	5x130
11108	Boulon Acier 5x130	BA5130	\N	\N	acier	5x130
11109	Boulon Brut 5x140	BB5140	\N	\N	none	5x140
11110	Boulon Zingué 5x140	BZ5140	\N	\N	cold	5x140
11111	Boulon Zingué à chaud 5x140	BZC5140	\N	\N	hot	5x140
11112	Boulon Acier 5x140	BA5140	\N	\N	acier	5x140
11113	Boulon Brut 5x150	BB5150	\N	\N	none	5x150
11114	Boulon Zingué 5x150	BZ5150	\N	\N	cold	5x150
11115	Boulon Zingué à chaud 5x150	BZC5150	\N	\N	hot	5x150
11116	Boulon Acier 5x150	BA5150	\N	\N	acier	5x150
11117	Boulon Brut 5x160	BB5160	\N	\N	none	5x160
11118	Boulon Zingué 5x160	BZ5160	\N	\N	cold	5x160
11119	Boulon Zingué à chaud 5x160	BZC5160	\N	\N	hot	5x160
11120	Boulon Acier 5x160	BA5160	\N	\N	acier	5x160
11121	Boulon Brut 5x170	BB5170	\N	\N	none	5x170
11122	Boulon Zingué 5x170	BZ5170	\N	\N	cold	5x170
11123	Boulon Zingué à chaud 5x170	BZC5170	\N	\N	hot	5x170
11124	Boulon Acier 5x170	BA5170	\N	\N	acier	5x170
11125	Boulon Brut 5x180	BB5180	\N	\N	none	5x180
11126	Boulon Zingué 5x180	BZ5180	\N	\N	cold	5x180
11127	Boulon Zingué à chaud 5x180	BZC5180	\N	\N	hot	5x180
11128	Boulon Acier 5x180	BA5180	\N	\N	acier	5x180
11129	Boulon Brut 5x190	BB5190	\N	\N	none	5x190
11130	Boulon Zingué 5x190	BZ5190	\N	\N	cold	5x190
11131	Boulon Zingué à chaud 5x190	BZC5190	\N	\N	hot	5x190
11132	Boulon Acier 5x190	BA5190	\N	\N	acier	5x190
11133	Boulon Brut 5x200	BB5200	\N	\N	none	5x200
11134	Boulon Zingué 5x200	BZ5200	\N	\N	cold	5x200
11135	Boulon Zingué à chaud 5x200	BZC5200	\N	\N	hot	5x200
11136	Boulon Acier 5x200	BA5200	\N	\N	acier	5x200
14359	Boulon Tête Fraisée Brut 10x12	BTFB1012	\N	\N	none	10x12
14360	Boulon Tête Fraisée Zingué 10x12	BTFZ1012	\N	\N	cold	10x12
14361	Boulon Tête Fraisée Zingué à chaud 10x12	BTFZC1012	\N	\N	hot	10x12
14362	Boulon Tête Fraisée Acier 10x12	BTFA1012	\N	\N	acier	10x12
14363	Boulon Tête Fraisée Brut 10x16	BTFB1016	\N	\N	none	10x16
14364	Boulon Tête Fraisée Zingué 10x16	BTFZ1016	\N	\N	cold	10x16
14365	Boulon Tête Fraisée Zingué à chaud 10x16	BTFZC1016	\N	\N	hot	10x16
14366	Boulon Tête Fraisée Acier 10x16	BTFA1016	\N	\N	acier	10x16
14367	Boulon Tête Fraisée Brut 10x20	BTFB1020	\N	\N	none	10x20
14368	Boulon Tête Fraisée Zingué 10x20	BTFZ1020	\N	\N	cold	10x20
14369	Boulon Tête Fraisée Zingué à chaud 10x20	BTFZC1020	\N	\N	hot	10x20
14370	Boulon Tête Fraisée Acier 10x20	BTFA1020	\N	\N	acier	10x20
14371	Boulon Tête Fraisée Brut 10x25	BTFB1025	\N	\N	none	10x25
14372	Boulon Tête Fraisée Zingué 10x25	BTFZ1025	\N	\N	cold	10x25
14373	Boulon Tête Fraisée Zingué à chaud 10x25	BTFZC1025	\N	\N	hot	10x25
14374	Boulon Tête Fraisée Acier 10x25	BTFA1025	\N	\N	acier	10x25
14375	Boulon Tête Fraisée Brut 10x30	BTFB1030	\N	\N	none	10x30
14376	Boulon Tête Fraisée Zingué 10x30	BTFZ1030	\N	\N	cold	10x30
14377	Boulon Tête Fraisée Zingué à chaud 10x30	BTFZC1030	\N	\N	hot	10x30
14378	Boulon Tête Fraisée Acier 10x30	BTFA1030	\N	\N	acier	10x30
14379	Boulon Tête Fraisée Brut 10x35	BTFB1035	\N	\N	none	10x35
14380	Boulon Tête Fraisée Zingué 10x35	BTFZ1035	\N	\N	cold	10x35
14381	Boulon Tête Fraisée Zingué à chaud 10x35	BTFZC1035	\N	\N	hot	10x35
14382	Boulon Tête Fraisée Acier 10x35	BTFA1035	\N	\N	acier	10x35
14383	Boulon Tête Fraisée Brut 10x40	BTFB1040	\N	\N	none	10x40
14384	Boulon Tête Fraisée Zingué 10x40	BTFZ1040	\N	\N	cold	10x40
14385	Boulon Tête Fraisée Zingué à chaud 10x40	BTFZC1040	\N	\N	hot	10x40
14386	Boulon Tête Fraisée Acier 10x40	BTFA1040	\N	\N	acier	10x40
14387	Boulon Tête Fraisée Brut 10x45	BTFB1045	\N	\N	none	10x45
14388	Boulon Tête Fraisée Zingué 10x45	BTFZ1045	\N	\N	cold	10x45
14389	Boulon Tête Fraisée Zingué à chaud 10x45	BTFZC1045	\N	\N	hot	10x45
14390	Boulon Tête Fraisée Acier 10x45	BTFA1045	\N	\N	acier	10x45
14391	Boulon Tête Fraisée Brut 10x50	BTFB1050	\N	\N	none	10x50
14392	Boulon Tête Fraisée Zingué 10x50	BTFZ1050	\N	\N	cold	10x50
14393	Boulon Tête Fraisée Zingué à chaud 10x50	BTFZC1050	\N	\N	hot	10x50
14394	Boulon Tête Fraisée Acier 10x50	BTFA1050	\N	\N	acier	10x50
14395	Boulon Tête Fraisée Brut 10x55	BTFB1055	\N	\N	none	10x55
14396	Boulon Tête Fraisée Zingué 10x55	BTFZ1055	\N	\N	cold	10x55
14397	Boulon Tête Fraisée Zingué à chaud 10x55	BTFZC1055	\N	\N	hot	10x55
14398	Boulon Tête Fraisée Acier 10x55	BTFA1055	\N	\N	acier	10x55
14399	Boulon Tête Fraisée Brut 10x60	BTFB1060	\N	\N	none	10x60
14400	Boulon Tête Fraisée Zingué 10x60	BTFZ1060	\N	\N	cold	10x60
14401	Boulon Tête Fraisée Zingué à chaud 10x60	BTFZC1060	\N	\N	hot	10x60
14402	Boulon Tête Fraisée Acier 10x60	BTFA1060	\N	\N	acier	10x60
14403	Boulon Tête Fraisée Brut 10x65	BTFB1065	\N	\N	none	10x65
14404	Boulon Tête Fraisée Zingué 10x65	BTFZ1065	\N	\N	cold	10x65
14405	Boulon Tête Fraisée Zingué à chaud 10x65	BTFZC1065	\N	\N	hot	10x65
14406	Boulon Tête Fraisée Acier 10x65	BTFA1065	\N	\N	acier	10x65
14407	Boulon Tête Fraisée Brut 10x70	BTFB1070	\N	\N	none	10x70
14408	Boulon Tête Fraisée Zingué 10x70	BTFZ1070	\N	\N	cold	10x70
14409	Boulon Tête Fraisée Zingué à chaud 10x70	BTFZC1070	\N	\N	hot	10x70
14410	Boulon Tête Fraisée Acier 10x70	BTFA1070	\N	\N	acier	10x70
14411	Boulon Tête Fraisée Brut 10x75	BTFB1075	\N	\N	none	10x75
14412	Boulon Tête Fraisée Zingué 10x75	BTFZ1075	\N	\N	cold	10x75
14413	Boulon Tête Fraisée Zingué à chaud 10x75	BTFZC1075	\N	\N	hot	10x75
14414	Boulon Tête Fraisée Acier 10x75	BTFA1075	\N	\N	acier	10x75
14415	Boulon Tête Fraisée Brut 10x80	BTFB1080	\N	\N	none	10x80
14416	Boulon Tête Fraisée Zingué 10x80	BTFZ1080	\N	\N	cold	10x80
14417	Boulon Tête Fraisée Zingué à chaud 10x80	BTFZC1080	\N	\N	hot	10x80
14418	Boulon Tête Fraisée Acier 10x80	BTFA1080	\N	\N	acier	10x80
14419	Boulon Tête Fraisée Brut 10x85	BTFB1085	\N	\N	none	10x85
14420	Boulon Tête Fraisée Zingué 10x85	BTFZ1085	\N	\N	cold	10x85
14421	Boulon Tête Fraisée Zingué à chaud 10x85	BTFZC1085	\N	\N	hot	10x85
14422	Boulon Tête Fraisée Acier 10x85	BTFA1085	\N	\N	acier	10x85
14423	Boulon Tête Fraisée Brut 10x90	BTFB1090	\N	\N	none	10x90
14424	Boulon Tête Fraisée Zingué 10x90	BTFZ1090	\N	\N	cold	10x90
14425	Boulon Tête Fraisée Zingué à chaud 10x90	BTFZC1090	\N	\N	hot	10x90
14426	Boulon Tête Fraisée Acier 10x90	BTFA1090	\N	\N	acier	10x90
14427	Boulon Tête Fraisée Brut 10x100	BTFB10100	\N	\N	none	10x100
14428	Boulon Tête Fraisée Zingué 10x100	BTFZ10100	\N	\N	cold	10x100
14429	Boulon Tête Fraisée Zingué à chaud 10x100	BTFZC10100	\N	\N	hot	10x100
14430	Boulon Tête Fraisée Acier 10x100	BTFA10100	\N	\N	acier	10x100
14431	Boulon Tête Fraisée Brut 10x110	BTFB10110	\N	\N	none	10x110
14432	Boulon Tête Fraisée Zingué 10x110	BTFZ10110	\N	\N	cold	10x110
14433	Boulon Tête Fraisée Zingué à chaud 10x110	BTFZC10110	\N	\N	hot	10x110
14434	Boulon Tête Fraisée Acier 10x110	BTFA10110	\N	\N	acier	10x110
14435	Boulon Tête Fraisée Brut 10x120	BTFB10120	\N	\N	none	10x120
14436	Boulon Tête Fraisée Zingué 10x120	BTFZ10120	\N	\N	cold	10x120
14437	Boulon Tête Fraisée Zingué à chaud 10x120	BTFZC10120	\N	\N	hot	10x120
14438	Boulon Tête Fraisée Acier 10x120	BTFA10120	\N	\N	acier	10x120
14439	Boulon Tête Fraisée Brut 10x130	BTFB10130	\N	\N	none	10x130
14440	Boulon Tête Fraisée Zingué 10x130	BTFZ10130	\N	\N	cold	10x130
14441	Boulon Tête Fraisée Zingué à chaud 10x130	BTFZC10130	\N	\N	hot	10x130
14442	Boulon Tête Fraisée Acier 10x130	BTFA10130	\N	\N	acier	10x130
14443	Boulon Tête Fraisée Brut 10x140	BTFB10140	\N	\N	none	10x140
14444	Boulon Tête Fraisée Zingué 10x140	BTFZ10140	\N	\N	cold	10x140
14445	Boulon Tête Fraisée Zingué à chaud 10x140	BTFZC10140	\N	\N	hot	10x140
14446	Boulon Tête Fraisée Acier 10x140	BTFA10140	\N	\N	acier	10x140
14447	Boulon Tête Fraisée Brut 10x150	BTFB10150	\N	\N	none	10x150
14448	Boulon Tête Fraisée Zingué 10x150	BTFZ10150	\N	\N	cold	10x150
14449	Boulon Tête Fraisée Zingué à chaud 10x150	BTFZC10150	\N	\N	hot	10x150
14450	Boulon Tête Fraisée Acier 10x150	BTFA10150	\N	\N	acier	10x150
14451	Boulon Tête Fraisée Brut 12x12	BTFB1212	\N	\N	none	12x12
14452	Boulon Tête Fraisée Zingué 12x12	BTFZ1212	\N	\N	cold	12x12
14453	Boulon Tête Fraisée Zingué à chaud 12x12	BTFZC1212	\N	\N	hot	12x12
14454	Boulon Tête Fraisée Acier 12x12	BTFA1212	\N	\N	acier	12x12
14455	Boulon Tête Fraisée Brut 12x16	BTFB1216	\N	\N	none	12x16
14456	Boulon Tête Fraisée Zingué 12x16	BTFZ1216	\N	\N	cold	12x16
14457	Boulon Tête Fraisée Zingué à chaud 12x16	BTFZC1216	\N	\N	hot	12x16
14458	Boulon Tête Fraisée Acier 12x16	BTFA1216	\N	\N	acier	12x16
14459	Boulon Tête Fraisée Brut 12x20	BTFB1220	\N	\N	none	12x20
14460	Boulon Tête Fraisée Zingué 12x20	BTFZ1220	\N	\N	cold	12x20
14461	Boulon Tête Fraisée Zingué à chaud 12x20	BTFZC1220	\N	\N	hot	12x20
14462	Boulon Tête Fraisée Acier 12x20	BTFA1220	\N	\N	acier	12x20
14463	Boulon Tête Fraisée Brut 12x25	BTFB1225	\N	\N	none	12x25
14464	Boulon Tête Fraisée Zingué 12x25	BTFZ1225	\N	\N	cold	12x25
14465	Boulon Tête Fraisée Zingué à chaud 12x25	BTFZC1225	\N	\N	hot	12x25
14466	Boulon Tête Fraisée Acier 12x25	BTFA1225	\N	\N	acier	12x25
14467	Boulon Tête Fraisée Brut 12x30	BTFB1230	\N	\N	none	12x30
14468	Boulon Tête Fraisée Zingué 12x30	BTFZ1230	\N	\N	cold	12x30
14469	Boulon Tête Fraisée Zingué à chaud 12x30	BTFZC1230	\N	\N	hot	12x30
14470	Boulon Tête Fraisée Acier 12x30	BTFA1230	\N	\N	acier	12x30
14471	Boulon Tête Fraisée Brut 12x35	BTFB1235	\N	\N	none	12x35
14472	Boulon Tête Fraisée Zingué 12x35	BTFZ1235	\N	\N	cold	12x35
14473	Boulon Tête Fraisée Zingué à chaud 12x35	BTFZC1235	\N	\N	hot	12x35
14474	Boulon Tête Fraisée Acier 12x35	BTFA1235	\N	\N	acier	12x35
14475	Boulon Tête Fraisée Brut 12x40	BTFB1240	\N	\N	none	12x40
14476	Boulon Tête Fraisée Zingué 12x40	BTFZ1240	\N	\N	cold	12x40
14477	Boulon Tête Fraisée Zingué à chaud 12x40	BTFZC1240	\N	\N	hot	12x40
14478	Boulon Tête Fraisée Acier 12x40	BTFA1240	\N	\N	acier	12x40
14479	Boulon Tête Fraisée Brut 12x45	BTFB1245	\N	\N	none	12x45
14480	Boulon Tête Fraisée Zingué 12x45	BTFZ1245	\N	\N	cold	12x45
14481	Boulon Tête Fraisée Zingué à chaud 12x45	BTFZC1245	\N	\N	hot	12x45
14482	Boulon Tête Fraisée Acier 12x45	BTFA1245	\N	\N	acier	12x45
14483	Boulon Tête Fraisée Brut 12x50	BTFB1250	\N	\N	none	12x50
14484	Boulon Tête Fraisée Zingué 12x50	BTFZ1250	\N	\N	cold	12x50
14485	Boulon Tête Fraisée Zingué à chaud 12x50	BTFZC1250	\N	\N	hot	12x50
14486	Boulon Tête Fraisée Acier 12x50	BTFA1250	\N	\N	acier	12x50
14487	Boulon Tête Fraisée Brut 12x55	BTFB1255	\N	\N	none	12x55
14488	Boulon Tête Fraisée Zingué 12x55	BTFZ1255	\N	\N	cold	12x55
14489	Boulon Tête Fraisée Zingué à chaud 12x55	BTFZC1255	\N	\N	hot	12x55
14490	Boulon Tête Fraisée Acier 12x55	BTFA1255	\N	\N	acier	12x55
14491	Boulon Tête Fraisée Brut 12x60	BTFB1260	\N	\N	none	12x60
14492	Boulon Tête Fraisée Zingué 12x60	BTFZ1260	\N	\N	cold	12x60
14493	Boulon Tête Fraisée Zingué à chaud 12x60	BTFZC1260	\N	\N	hot	12x60
14494	Boulon Tête Fraisée Acier 12x60	BTFA1260	\N	\N	acier	12x60
14495	Boulon Tête Fraisée Brut 12x65	BTFB1265	\N	\N	none	12x65
14496	Boulon Tête Fraisée Zingué 12x65	BTFZ1265	\N	\N	cold	12x65
14497	Boulon Tête Fraisée Zingué à chaud 12x65	BTFZC1265	\N	\N	hot	12x65
14498	Boulon Tête Fraisée Acier 12x65	BTFA1265	\N	\N	acier	12x65
14499	Boulon Tête Fraisée Brut 12x70	BTFB1270	\N	\N	none	12x70
14500	Boulon Tête Fraisée Zingué 12x70	BTFZ1270	\N	\N	cold	12x70
14501	Boulon Tête Fraisée Zingué à chaud 12x70	BTFZC1270	\N	\N	hot	12x70
14502	Boulon Tête Fraisée Acier 12x70	BTFA1270	\N	\N	acier	12x70
14503	Boulon Tête Fraisée Brut 12x75	BTFB1275	\N	\N	none	12x75
14504	Boulon Tête Fraisée Zingué 12x75	BTFZ1275	\N	\N	cold	12x75
14505	Boulon Tête Fraisée Zingué à chaud 12x75	BTFZC1275	\N	\N	hot	12x75
14506	Boulon Tête Fraisée Acier 12x75	BTFA1275	\N	\N	acier	12x75
14507	Boulon Tête Fraisée Brut 12x80	BTFB1280	\N	\N	none	12x80
14508	Boulon Tête Fraisée Zingué 12x80	BTFZ1280	\N	\N	cold	12x80
14509	Boulon Tête Fraisée Zingué à chaud 12x80	BTFZC1280	\N	\N	hot	12x80
14510	Boulon Tête Fraisée Acier 12x80	BTFA1280	\N	\N	acier	12x80
14511	Boulon Tête Fraisée Brut 12x85	BTFB1285	\N	\N	none	12x85
14512	Boulon Tête Fraisée Zingué 12x85	BTFZ1285	\N	\N	cold	12x85
14513	Boulon Tête Fraisée Zingué à chaud 12x85	BTFZC1285	\N	\N	hot	12x85
14514	Boulon Tête Fraisée Acier 12x85	BTFA1285	\N	\N	acier	12x85
14515	Boulon Tête Fraisée Brut 12x90	BTFB1290	\N	\N	none	12x90
14516	Boulon Tête Fraisée Zingué 12x90	BTFZ1290	\N	\N	cold	12x90
14517	Boulon Tête Fraisée Zingué à chaud 12x90	BTFZC1290	\N	\N	hot	12x90
14518	Boulon Tête Fraisée Acier 12x90	BTFA1290	\N	\N	acier	12x90
14519	Boulon Tête Fraisée Brut 12x100	BTFB12100	\N	\N	none	12x100
14520	Boulon Tête Fraisée Zingué 12x100	BTFZ12100	\N	\N	cold	12x100
14521	Boulon Tête Fraisée Zingué à chaud 12x100	BTFZC12100	\N	\N	hot	12x100
14522	Boulon Tête Fraisée Acier 12x100	BTFA12100	\N	\N	acier	12x100
14523	Boulon Tête Fraisée Brut 12x110	BTFB12110	\N	\N	none	12x110
14524	Boulon Tête Fraisée Zingué 12x110	BTFZ12110	\N	\N	cold	12x110
14525	Boulon Tête Fraisée Zingué à chaud 12x110	BTFZC12110	\N	\N	hot	12x110
14526	Boulon Tête Fraisée Acier 12x110	BTFA12110	\N	\N	acier	12x110
14527	Boulon Tête Fraisée Brut 12x120	BTFB12120	\N	\N	none	12x120
14528	Boulon Tête Fraisée Zingué 12x120	BTFZ12120	\N	\N	cold	12x120
14529	Boulon Tête Fraisée Zingué à chaud 12x120	BTFZC12120	\N	\N	hot	12x120
14530	Boulon Tête Fraisée Acier 12x120	BTFA12120	\N	\N	acier	12x120
14531	Boulon Tête Fraisée Brut 12x130	BTFB12130	\N	\N	none	12x130
14532	Boulon Tête Fraisée Zingué 12x130	BTFZ12130	\N	\N	cold	12x130
14533	Boulon Tête Fraisée Zingué à chaud 12x130	BTFZC12130	\N	\N	hot	12x130
14534	Boulon Tête Fraisée Acier 12x130	BTFA12130	\N	\N	acier	12x130
14535	Boulon Tête Fraisée Brut 12x140	BTFB12140	\N	\N	none	12x140
14536	Boulon Tête Fraisée Zingué 12x140	BTFZ12140	\N	\N	cold	12x140
14537	Boulon Tête Fraisée Zingué à chaud 12x140	BTFZC12140	\N	\N	hot	12x140
14538	Boulon Tête Fraisée Acier 12x140	BTFA12140	\N	\N	acier	12x140
14539	Boulon Tête Fraisée Brut 12x150	BTFB12150	\N	\N	none	12x150
14540	Boulon Tête Fraisée Zingué 12x150	BTFZ12150	\N	\N	cold	12x150
14541	Boulon Tête Fraisée Zingué à chaud 12x150	BTFZC12150	\N	\N	hot	12x150
14542	Boulon Tête Fraisée Acier 12x150	BTFA12150	\N	\N	acier	12x150
13807	Boulon Poelier Brut 10x12	BPB1012	\N	\N	none	10x12
13808	Boulon Poelier Zingué 10x12	BPZ1012	\N	\N	cold	10x12
13809	Boulon Poelier Zingué à chaud 10x12	BPZC1012	\N	\N	hot	10x12
13810	Boulon Poelier Acier 10x12	BPA1012	\N	\N	acier	10x12
13811	Boulon Poelier Brut 10x16	BPB1016	\N	\N	none	10x16
13812	Boulon Poelier Zingué 10x16	BPZ1016	\N	\N	cold	10x16
13813	Boulon Poelier Zingué à chaud 10x16	BPZC1016	\N	\N	hot	10x16
13814	Boulon Poelier Acier 10x16	BPA1016	\N	\N	acier	10x16
13815	Boulon Poelier Brut 10x20	BPB1020	\N	\N	none	10x20
13816	Boulon Poelier Zingué 10x20	BPZ1020	\N	\N	cold	10x20
13817	Boulon Poelier Zingué à chaud 10x20	BPZC1020	\N	\N	hot	10x20
13818	Boulon Poelier Acier 10x20	BPA1020	\N	\N	acier	10x20
13819	Boulon Poelier Brut 10x25	BPB1025	\N	\N	none	10x25
13820	Boulon Poelier Zingué 10x25	BPZ1025	\N	\N	cold	10x25
13821	Boulon Poelier Zingué à chaud 10x25	BPZC1025	\N	\N	hot	10x25
13822	Boulon Poelier Acier 10x25	BPA1025	\N	\N	acier	10x25
13823	Boulon Poelier Brut 10x30	BPB1030	\N	\N	none	10x30
13824	Boulon Poelier Zingué 10x30	BPZ1030	\N	\N	cold	10x30
13825	Boulon Poelier Zingué à chaud 10x30	BPZC1030	\N	\N	hot	10x30
13826	Boulon Poelier Acier 10x30	BPA1030	\N	\N	acier	10x30
13827	Boulon Poelier Brut 10x35	BPB1035	\N	\N	none	10x35
13828	Boulon Poelier Zingué 10x35	BPZ1035	\N	\N	cold	10x35
13829	Boulon Poelier Zingué à chaud 10x35	BPZC1035	\N	\N	hot	10x35
13830	Boulon Poelier Acier 10x35	BPA1035	\N	\N	acier	10x35
13831	Boulon Poelier Brut 10x40	BPB1040	\N	\N	none	10x40
13832	Boulon Poelier Zingué 10x40	BPZ1040	\N	\N	cold	10x40
13833	Boulon Poelier Zingué à chaud 10x40	BPZC1040	\N	\N	hot	10x40
13834	Boulon Poelier Acier 10x40	BPA1040	\N	\N	acier	10x40
13835	Boulon Poelier Brut 10x45	BPB1045	\N	\N	none	10x45
13836	Boulon Poelier Zingué 10x45	BPZ1045	\N	\N	cold	10x45
13837	Boulon Poelier Zingué à chaud 10x45	BPZC1045	\N	\N	hot	10x45
13838	Boulon Poelier Acier 10x45	BPA1045	\N	\N	acier	10x45
13839	Boulon Poelier Brut 10x50	BPB1050	\N	\N	none	10x50
13840	Boulon Poelier Zingué 10x50	BPZ1050	\N	\N	cold	10x50
13841	Boulon Poelier Zingué à chaud 10x50	BPZC1050	\N	\N	hot	10x50
13842	Boulon Poelier Acier 10x50	BPA1050	\N	\N	acier	10x50
13843	Boulon Poelier Brut 10x55	BPB1055	\N	\N	none	10x55
13844	Boulon Poelier Zingué 10x55	BPZ1055	\N	\N	cold	10x55
13845	Boulon Poelier Zingué à chaud 10x55	BPZC1055	\N	\N	hot	10x55
13846	Boulon Poelier Acier 10x55	BPA1055	\N	\N	acier	10x55
13847	Boulon Poelier Brut 10x60	BPB1060	\N	\N	none	10x60
13848	Boulon Poelier Zingué 10x60	BPZ1060	\N	\N	cold	10x60
13849	Boulon Poelier Zingué à chaud 10x60	BPZC1060	\N	\N	hot	10x60
13850	Boulon Poelier Acier 10x60	BPA1060	\N	\N	acier	10x60
13851	Boulon Poelier Brut 10x65	BPB1065	\N	\N	none	10x65
13852	Boulon Poelier Zingué 10x65	BPZ1065	\N	\N	cold	10x65
13853	Boulon Poelier Zingué à chaud 10x65	BPZC1065	\N	\N	hot	10x65
13854	Boulon Poelier Acier 10x65	BPA1065	\N	\N	acier	10x65
13855	Boulon Poelier Brut 10x70	BPB1070	\N	\N	none	10x70
13856	Boulon Poelier Zingué 10x70	BPZ1070	\N	\N	cold	10x70
13857	Boulon Poelier Zingué à chaud 10x70	BPZC1070	\N	\N	hot	10x70
13858	Boulon Poelier Acier 10x70	BPA1070	\N	\N	acier	10x70
13859	Boulon Poelier Brut 10x75	BPB1075	\N	\N	none	10x75
13860	Boulon Poelier Zingué 10x75	BPZ1075	\N	\N	cold	10x75
13861	Boulon Poelier Zingué à chaud 10x75	BPZC1075	\N	\N	hot	10x75
13862	Boulon Poelier Acier 10x75	BPA1075	\N	\N	acier	10x75
13863	Boulon Poelier Brut 10x80	BPB1080	\N	\N	none	10x80
13864	Boulon Poelier Zingué 10x80	BPZ1080	\N	\N	cold	10x80
13865	Boulon Poelier Zingué à chaud 10x80	BPZC1080	\N	\N	hot	10x80
13866	Boulon Poelier Acier 10x80	BPA1080	\N	\N	acier	10x80
13867	Boulon Poelier Brut 10x85	BPB1085	\N	\N	none	10x85
13868	Boulon Poelier Zingué 10x85	BPZ1085	\N	\N	cold	10x85
13869	Boulon Poelier Zingué à chaud 10x85	BPZC1085	\N	\N	hot	10x85
13870	Boulon Poelier Acier 10x85	BPA1085	\N	\N	acier	10x85
13871	Boulon Poelier Brut 10x90	BPB1090	\N	\N	none	10x90
13872	Boulon Poelier Zingué 10x90	BPZ1090	\N	\N	cold	10x90
13873	Boulon Poelier Zingué à chaud 10x90	BPZC1090	\N	\N	hot	10x90
13874	Boulon Poelier Acier 10x90	BPA1090	\N	\N	acier	10x90
13875	Boulon Poelier Brut 10x100	BPB10100	\N	\N	none	10x100
13876	Boulon Poelier Zingué 10x100	BPZ10100	\N	\N	cold	10x100
13877	Boulon Poelier Zingué à chaud 10x100	BPZC10100	\N	\N	hot	10x100
13878	Boulon Poelier Acier 10x100	BPA10100	\N	\N	acier	10x100
13879	Boulon Poelier Brut 10x110	BPB10110	\N	\N	none	10x110
13880	Boulon Poelier Zingué 10x110	BPZ10110	\N	\N	cold	10x110
13881	Boulon Poelier Zingué à chaud 10x110	BPZC10110	\N	\N	hot	10x110
13882	Boulon Poelier Acier 10x110	BPA10110	\N	\N	acier	10x110
13883	Boulon Poelier Brut 10x120	BPB10120	\N	\N	none	10x120
13884	Boulon Poelier Zingué 10x120	BPZ10120	\N	\N	cold	10x120
13885	Boulon Poelier Zingué à chaud 10x120	BPZC10120	\N	\N	hot	10x120
13886	Boulon Poelier Acier 10x120	BPA10120	\N	\N	acier	10x120
13887	Boulon Poelier Brut 10x130	BPB10130	\N	\N	none	10x130
13888	Boulon Poelier Zingué 10x130	BPZ10130	\N	\N	cold	10x130
13889	Boulon Poelier Zingué à chaud 10x130	BPZC10130	\N	\N	hot	10x130
13890	Boulon Poelier Acier 10x130	BPA10130	\N	\N	acier	10x130
13891	Boulon Poelier Brut 10x140	BPB10140	\N	\N	none	10x140
13892	Boulon Poelier Zingué 10x140	BPZ10140	\N	\N	cold	10x140
13893	Boulon Poelier Zingué à chaud 10x140	BPZC10140	\N	\N	hot	10x140
13894	Boulon Poelier Acier 10x140	BPA10140	\N	\N	acier	10x140
13895	Boulon Poelier Brut 10x150	BPB10150	\N	\N	none	10x150
13896	Boulon Poelier Zingué 10x150	BPZ10150	\N	\N	cold	10x150
13897	Boulon Poelier Zingué à chaud 10x150	BPZC10150	\N	\N	hot	10x150
13898	Boulon Poelier Acier 10x150	BPA10150	\N	\N	acier	10x150
13899	Boulon Poelier Brut 12x12	BPB1212	\N	\N	none	12x12
13900	Boulon Poelier Zingué 12x12	BPZ1212	\N	\N	cold	12x12
13901	Boulon Poelier Zingué à chaud 12x12	BPZC1212	\N	\N	hot	12x12
13902	Boulon Poelier Acier 12x12	BPA1212	\N	\N	acier	12x12
13903	Boulon Poelier Brut 12x16	BPB1216	\N	\N	none	12x16
13904	Boulon Poelier Zingué 12x16	BPZ1216	\N	\N	cold	12x16
13905	Boulon Poelier Zingué à chaud 12x16	BPZC1216	\N	\N	hot	12x16
13906	Boulon Poelier Acier 12x16	BPA1216	\N	\N	acier	12x16
13907	Boulon Poelier Brut 12x20	BPB1220	\N	\N	none	12x20
13908	Boulon Poelier Zingué 12x20	BPZ1220	\N	\N	cold	12x20
13909	Boulon Poelier Zingué à chaud 12x20	BPZC1220	\N	\N	hot	12x20
13910	Boulon Poelier Acier 12x20	BPA1220	\N	\N	acier	12x20
13911	Boulon Poelier Brut 12x25	BPB1225	\N	\N	none	12x25
13912	Boulon Poelier Zingué 12x25	BPZ1225	\N	\N	cold	12x25
13913	Boulon Poelier Zingué à chaud 12x25	BPZC1225	\N	\N	hot	12x25
13914	Boulon Poelier Acier 12x25	BPA1225	\N	\N	acier	12x25
13915	Boulon Poelier Brut 12x30	BPB1230	\N	\N	none	12x30
13916	Boulon Poelier Zingué 12x30	BPZ1230	\N	\N	cold	12x30
13917	Boulon Poelier Zingué à chaud 12x30	BPZC1230	\N	\N	hot	12x30
13918	Boulon Poelier Acier 12x30	BPA1230	\N	\N	acier	12x30
13919	Boulon Poelier Brut 12x35	BPB1235	\N	\N	none	12x35
13920	Boulon Poelier Zingué 12x35	BPZ1235	\N	\N	cold	12x35
13921	Boulon Poelier Zingué à chaud 12x35	BPZC1235	\N	\N	hot	12x35
13922	Boulon Poelier Acier 12x35	BPA1235	\N	\N	acier	12x35
13923	Boulon Poelier Brut 12x40	BPB1240	\N	\N	none	12x40
13924	Boulon Poelier Zingué 12x40	BPZ1240	\N	\N	cold	12x40
13925	Boulon Poelier Zingué à chaud 12x40	BPZC1240	\N	\N	hot	12x40
13926	Boulon Poelier Acier 12x40	BPA1240	\N	\N	acier	12x40
13927	Boulon Poelier Brut 12x45	BPB1245	\N	\N	none	12x45
13928	Boulon Poelier Zingué 12x45	BPZ1245	\N	\N	cold	12x45
13929	Boulon Poelier Zingué à chaud 12x45	BPZC1245	\N	\N	hot	12x45
13930	Boulon Poelier Acier 12x45	BPA1245	\N	\N	acier	12x45
13931	Boulon Poelier Brut 12x50	BPB1250	\N	\N	none	12x50
13932	Boulon Poelier Zingué 12x50	BPZ1250	\N	\N	cold	12x50
13933	Boulon Poelier Zingué à chaud 12x50	BPZC1250	\N	\N	hot	12x50
13934	Boulon Poelier Acier 12x50	BPA1250	\N	\N	acier	12x50
13935	Boulon Poelier Brut 12x55	BPB1255	\N	\N	none	12x55
13936	Boulon Poelier Zingué 12x55	BPZ1255	\N	\N	cold	12x55
13937	Boulon Poelier Zingué à chaud 12x55	BPZC1255	\N	\N	hot	12x55
13938	Boulon Poelier Acier 12x55	BPA1255	\N	\N	acier	12x55
13939	Boulon Poelier Brut 12x60	BPB1260	\N	\N	none	12x60
13940	Boulon Poelier Zingué 12x60	BPZ1260	\N	\N	cold	12x60
13941	Boulon Poelier Zingué à chaud 12x60	BPZC1260	\N	\N	hot	12x60
13942	Boulon Poelier Acier 12x60	BPA1260	\N	\N	acier	12x60
13943	Boulon Poelier Brut 12x65	BPB1265	\N	\N	none	12x65
13944	Boulon Poelier Zingué 12x65	BPZ1265	\N	\N	cold	12x65
13945	Boulon Poelier Zingué à chaud 12x65	BPZC1265	\N	\N	hot	12x65
13946	Boulon Poelier Acier 12x65	BPA1265	\N	\N	acier	12x65
13947	Boulon Poelier Brut 12x70	BPB1270	\N	\N	none	12x70
13948	Boulon Poelier Zingué 12x70	BPZ1270	\N	\N	cold	12x70
13949	Boulon Poelier Zingué à chaud 12x70	BPZC1270	\N	\N	hot	12x70
13950	Boulon Poelier Acier 12x70	BPA1270	\N	\N	acier	12x70
13951	Boulon Poelier Brut 12x75	BPB1275	\N	\N	none	12x75
13952	Boulon Poelier Zingué 12x75	BPZ1275	\N	\N	cold	12x75
13953	Boulon Poelier Zingué à chaud 12x75	BPZC1275	\N	\N	hot	12x75
13954	Boulon Poelier Acier 12x75	BPA1275	\N	\N	acier	12x75
13955	Boulon Poelier Brut 12x80	BPB1280	\N	\N	none	12x80
13956	Boulon Poelier Zingué 12x80	BPZ1280	\N	\N	cold	12x80
13957	Boulon Poelier Zingué à chaud 12x80	BPZC1280	\N	\N	hot	12x80
13958	Boulon Poelier Acier 12x80	BPA1280	\N	\N	acier	12x80
13959	Boulon Poelier Brut 12x85	BPB1285	\N	\N	none	12x85
13960	Boulon Poelier Zingué 12x85	BPZ1285	\N	\N	cold	12x85
13961	Boulon Poelier Zingué à chaud 12x85	BPZC1285	\N	\N	hot	12x85
13962	Boulon Poelier Acier 12x85	BPA1285	\N	\N	acier	12x85
13963	Boulon Poelier Brut 12x90	BPB1290	\N	\N	none	12x90
13964	Boulon Poelier Zingué 12x90	BPZ1290	\N	\N	cold	12x90
13965	Boulon Poelier Zingué à chaud 12x90	BPZC1290	\N	\N	hot	12x90
13966	Boulon Poelier Acier 12x90	BPA1290	\N	\N	acier	12x90
13967	Boulon Poelier Brut 12x100	BPB12100	\N	\N	none	12x100
13968	Boulon Poelier Zingué 12x100	BPZ12100	\N	\N	cold	12x100
13969	Boulon Poelier Zingué à chaud 12x100	BPZC12100	\N	\N	hot	12x100
13970	Boulon Poelier Acier 12x100	BPA12100	\N	\N	acier	12x100
13971	Boulon Poelier Brut 12x110	BPB12110	\N	\N	none	12x110
13972	Boulon Poelier Zingué 12x110	BPZ12110	\N	\N	cold	12x110
13973	Boulon Poelier Zingué à chaud 12x110	BPZC12110	\N	\N	hot	12x110
13974	Boulon Poelier Acier 12x110	BPA12110	\N	\N	acier	12x110
13975	Boulon Poelier Brut 12x120	BPB12120	\N	\N	none	12x120
13976	Boulon Poelier Zingué 12x120	BPZ12120	\N	\N	cold	12x120
13977	Boulon Poelier Zingué à chaud 12x120	BPZC12120	\N	\N	hot	12x120
13978	Boulon Poelier Acier 12x120	BPA12120	\N	\N	acier	12x120
13979	Boulon Poelier Brut 12x130	BPB12130	\N	\N	none	12x130
13980	Boulon Poelier Zingué 12x130	BPZ12130	\N	\N	cold	12x130
13981	Boulon Poelier Zingué à chaud 12x130	BPZC12130	\N	\N	hot	12x130
13982	Boulon Poelier Acier 12x130	BPA12130	\N	\N	acier	12x130
13983	Boulon Poelier Brut 12x140	BPB12140	\N	\N	none	12x140
13984	Boulon Poelier Zingué 12x140	BPZ12140	\N	\N	cold	12x140
13985	Boulon Poelier Zingué à chaud 12x140	BPZC12140	\N	\N	hot	12x140
13986	Boulon Poelier Acier 12x140	BPA12140	\N	\N	acier	12x140
13987	Boulon Poelier Brut 12x150	BPB12150	\N	\N	none	12x150
13988	Boulon Poelier Zingué 12x150	BPZ12150	\N	\N	cold	12x150
13989	Boulon Poelier Zingué à chaud 12x150	BPZC12150	\N	\N	hot	12x150
13990	Boulon Poelier Acier 12x150	BPA12150	\N	\N	acier	12x150
\.


--
-- Data for Name: push_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.push_tokens (id, user_id, token, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
8SNoazdPemlJlO-bwTOPmyMJmwoGBy1I	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-10T20:19:27.313Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "b16b9c8d-5076-4c9b-9b19-609a8d16fec0"}	2026-02-10 20:20:24
hXNnaN_dLdJziC8ct8kAvJ5mfAS0kYdl	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-13T12:36:07.762Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "1f34adf3-dbd8-4803-8e46-713bca852f04"}	2026-02-13 12:36:39
B8F1M4qb80jodHpEySm-FusuDnusWgSP	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-09T22:17:50.458Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "0NxrDnbW6vQNz4vc5UMH6snd17QXa-0yAuvHKCc3xQ0"}}	2026-02-10 23:11:51
flkVS7-XECxQYtjiLGUTJlCnm9kNyBz5	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-13T12:43:24.695Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "e429da65-e190-470b-aac2-6f61b59910dd"}	2026-02-13 12:43:25
YDZed62DiKjR0Fqsau5eliCSSistr8Ms	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-13T11:49:00.806Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "c5f5033a-a7c8-4551-8ed1-9bd2ca457e97"}	2026-02-13 11:49:31
k75KFKxCPdwo0uKCctr9Y-pp1dDDCxHh	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-17T16:43:32.225Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "c5f5033a-a7c8-4551-8ed1-9bd2ca457e97"}	2026-02-17 17:31:56
X2Rm7_r-gIlXlW8qIGf6NdXir4Kaz0eG	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-10T20:22:14.543Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "b16b9c8d-5076-4c9b-9b19-609a8d16fec0"}	2026-02-10 20:22:15
no1LjGq1chbJpPF-JTKunTXsmpxC0-jQ	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-10T21:29:34.759Z", "httpOnly": true, "originalMaxAge": 604800000}, "userId": "c5f5033a-a7c8-4551-8ed1-9bd2ca457e97"}	2026-02-10 21:30:00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (user_id, role, sales_point_name) FROM stdin;
2430e382-c6f2-4b05-85fa-c6127c0d8fb9	admin	\N
54123747	admin	\N
b16b9c8d-5076-4c9b-9b19-609a8d16fec0	admin	\N
e429da65-e190-470b-aac2-6f61b59910dd	admin	\N
1f34adf3-dbd8-4803-8e46-713bca852f04	reception	\N
f4f6bc67-0521-432c-a131-e4436979b734	reception	\N
b62f0e67-b8f7-45a6-abd0-4d1977f97dc7	reception	\N
8be44d8c-b685-4816-9d93-609a6c471413	shipping	\N
c5f5033a-a7c8-4551-8ed1-9bd2ca457e97	sales_point	الجزائر
dbebebdb-0cd0-453e-bf53-8604423984c3	sales_point	الوادي
959cf514-0c1e-4af3-825c-2f6f80c5c74b	sales_point	العلمة
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, username, password) FROM stdin;
b16b9c8d-5076-4c9b-9b19-609a8d16fec0	\N	موظف المصنع	\N	\N	2026-02-02 22:52:31.182698	2026-02-02 22:52:31.182698	factory	$2b$10$1f9s6/CgRme0uWgZSKl3hOfIq.a1GuUl8uBOupqb0hoYKcOXdUNiq
2430e382-c6f2-4b05-85fa-c6127c0d8fb9	\N	المالك	\N	\N	2026-02-02 22:52:31.077073	2026-02-02 22:52:31.077073	owner	$2b$10$LxPrvSMKFMJMFGd/1c79yundXoJR9o3PkkN2uHegfmJO3cGLMQA16
54123747	souhailted2@gmail.com	souhail	tedjani	\N	2026-02-02 21:42:33.615112	2026-02-02 21:44:40.47	admin	$2a$10$D3Vdz8qQ9K8bJz6q2dJMq.E4aZ3h1pWr3sL5vN8uB7cX6jH4gF2iK
e429da65-e190-470b-aac2-6f61b59910dd	\N	المدير العام	\N	\N	2026-02-06 12:42:46.474939	2026-02-06 12:42:46.474939	المدير العام	$2b$10$xAsQuKPh.5C0F9TZAjRufe5VJW1bogbbULlYcQrPrcwmtbLqKyw4K
1f34adf3-dbd8-4803-8e46-713bca852f04	\N	طارق	\N	\N	2026-02-06 12:06:21.506858	2026-02-06 12:06:21.506858	reception1	$2b$10$HATXiQgHP45Kkgi7yGbyz.Gt1nfa8WFyYy9myRHqfIWLX1lwxmeNC
f4f6bc67-0521-432c-a131-e4436979b734	\N	العيد	\N	\N	2026-02-06 12:06:21.609753	2026-02-06 12:06:21.609753	reception2	$2b$10$oi/3kH7tbrxycko8BZl6BOs43XUWKzg0zPbN8YA9LgTYUCgy66RrG
b62f0e67-b8f7-45a6-abd0-4d1977f97dc7	\N	وليد	\N	\N	2026-02-06 12:06:21.706227	2026-02-06 12:06:21.706227	reception3	$2b$10$rjkNsbpW6dCz9X.V6O6GuO4kKqdJD83Jl5xtTzhbRuftM2XLUa.Yi
8be44d8c-b685-4816-9d93-609a6c471413	\N	فريق الشحن	\N	\N	2026-02-06 12:06:21.805755	2026-02-06 12:06:21.805755	shipping	$2b$10$X1HKufA4ZWVYNyWes6rPq.Vu/V14h6rhtciz.owQ6BgRkuS3spimy
c5f5033a-a7c8-4551-8ed1-9bd2ca457e97	\N	نقطة بيع الجزائر	\N	\N	2026-02-02 22:52:31.294832	2026-02-02 22:52:31.294832	alger	$2b$10$QxgqKowJ9EUGhDkymw05XOgGeKj132JDJleC77avv/AlGrP/6BixK
dbebebdb-0cd0-453e-bf53-8604423984c3	\N	نقطة بيع الوادي	\N	\N	2026-02-02 22:52:31.41937	2026-02-02 22:52:31.41937	eloued	$2b$10$ovVMeMFG3IUAdmw3Vy8tC./nEYsZu7ikibr1GeowQzGjtzuWhM/qq
959cf514-0c1e-4af3-825c-2f6f80c5c74b	\N	نقطة بيع العلمة	\N	\N	2026-02-02 22:52:31.547801	2026-02-02 22:52:31.547801	elma	$2b$10$tzioGI4LYqRjFOBFXZ6wHe.5bORL34lJCekFFzcMps3r8/ZJ2NyqK
\.


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 53, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 14, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 8, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 769079, true);


--
-- Name: push_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.push_tokens_id_seq', 1, false);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: push_tokens push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_tokens
    ADD CONSTRAINT push_tokens_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: notifications notifications_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_sales_point_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_sales_point_id_users_id_fk FOREIGN KEY (sales_point_id) REFERENCES public.users(id);


--
-- Name: orders orders_status_changed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_status_changed_by_users_id_fk FOREIGN KEY (status_changed_by) REFERENCES public.users(id);


--
-- Name: push_tokens push_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_tokens
    ADD CONSTRAINT push_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict BI3Hfg7DZeI2GyTksMTU7E6at3fVt5bfugrchYY279ib6aARpqEQ1RY1qOSwENI

