-- =====================================================
-- Production Database Backup
-- Generated: 2026-02-24
-- Application: Inventory Management System
-- =====================================================

-- ===== USERS =====
INSERT INTO users (id, username, password, display_name, role, active, created_at) VALUES
(1, 'admin', '$2b$10$Hi7ASF9SnHOXVP5b3nf66eF0MwhmiOPUVolgzVmXRuDUFkSc7VUj.', 'المدير', 'admin', true, '2026-02-15 06:10:17.027526'),
(2, 'tedjani', '$2b$10$uB3pG1GG49KpQvS8TbpgAe.tkyoz1ApJCq/X8G/dG.YBP2MLbyC5S', 'tedjani', 'user', true, '2026-02-15 06:42:36.735498'),
(3, 'tarek', '$2b$10$kKWovlBSsCWq8J0tiNbiB.fQesvRqsNXmBdLm5qYAQEGDGqOWAaYu', 'tarek', 'user', true, '2026-02-15 08:04:54.18516'),
(4, 'ISLAM', '$2b$10$BO57C2zpuWYXXsHNdDRX5.BC8eokD6uNBaXTC/a9bDw77t.DuUC3u', 'ISLAM', 'user', true, '2026-02-16 09:21:29.589201'),
(5, 'ISLAM2', '$2b$10$WaOFKrKMm0R7qUughzEfPevvTl9u6HERj7fNtj/WALBKNBeWZb51W', 'ISLAM2', 'warehouse', true, '2026-02-16 09:22:38.476477')
ON CONFLICT (id) DO NOTHING;

-- ===== CATEGORIES =====
INSERT INTO categories (id, name) VALUES
(1, 'boulon'),
(2, 'VIDE'),
(3, 'VIDE2'),
(4, 'قطع غيار'),
(5, 'MACHINE'),
(6, 'منتج جاهز'),
(9, 'نصف مصنعه')
ON CONFLICT (id) DO NOTHING;

-- ===== SUPPLIERS =====
INSERT INTO suppliers (id, name, phone, address) VALUES
(1, 'BALA 1 LILI', '+86 20 8888 1234', 'جوانزو، الصين'),
(2, 'MOUSSA', '+86 755 2666 5678', 'شنزن، الصين'),
(3, 'BAGUETE FONT', '+86 579 8523 9012', 'ييوو، تشجيانغ، الصين'),
(4, 'patta', '', ''),
(5, 'AHMED', '0555', ''),
(6, 'USINE PELLE 2 EVA', '13832557961', 'YIWU'),
(7, 'COLLE LONGE', '', ''),
(8, 'NANCY MACINE PLASTIC NINGBO', '008657486188011', 'NINGBO CHINA')
ON CONFLICT (id) DO NOTHING;

-- ===== WAREHOUSES =====
INSERT INTO warehouses (id, name) VALUES
(1, 'YIWU'),
(2, 'مخزن شنزن'),
(3, 'depot YIWU')
ON CONFLICT (id) DO NOTHING;

-- ===== SHIPPING COMPANIES =====
INSERT INTO shipping_companies (id, name, phone, address) VALUES
(1, 'magie', '', '')
ON CONFLICT (id) DO NOTHING;

-- ===== PRODUCTS =====
INSERT INTO products (id, name, quantity, category_id, status, status_changed_at, name_zh) VALUES
(83, 'colon meulongeur avabo plastic', 2600, 9, 'received', '2026-02-17 13:51:50.686', NULL),
(84, 'poignee melongeur plastic', 7000, 9, 'received', '2026-02-17 13:51:50.775', NULL),
(85, 'coce melongeur avabo plastic', 4940, 9, 'received', '2026-02-17 13:51:50.864', NULL),
(86, 'bouchon poignee melongeur', 10000, 9, 'received', '2026-02-17 13:51:50.954', NULL),
(87, 'mecanisme melongeur plasic', 10000, 9, 'received', '2026-02-17 13:51:51.044', NULL),
(88, 'coce  2 melongeur avabo plastic', 900, 9, 'received', '2026-02-17 13:51:51.138', NULL),
(89, 'boite  melongeur', 2300, 9, 'received', '2026-02-17 13:51:51.237', NULL),
(90, 'presse', 1, 9, 'received', '2026-02-17 13:51:51.334', NULL),
(91, 'mecanisme miltegeur', 11000, 9, 'received', '2026-02-17 13:51:51.424', NULL),
(92, 'kit melongeur memlon', 6000, 9, 'received', '2026-02-17 13:51:51.512', NULL),
(93, 'poignee meltegeure crome', 2000, 9, 'received', '2026-02-17 13:51:51.6', NULL),
(94, 'fixation meltigeur', 12000, 9, 'received', '2026-02-17 13:51:51.689', NULL),
(95, 'supor tv accesoire h', 7425, 9, 'received', '2026-02-17 13:51:51.777', NULL),
(96, 'supor tv accesoire g', 5865, 9, 'received', '2026-02-17 13:51:51.865', NULL),
(97, 'supor tv accesoire F', 7097, 9, 'received', '2026-02-17 13:51:51.965', NULL),
(98, 'GLISSIER 30', 10000, 9, 'received', '2026-02-17 13:51:52.056', NULL),
(99, 'GLISSIER 35', 10000, 9, 'received', '2026-02-17 13:51:52.146', NULL),
(100, 'GLISSIER 40', 5000, 9, 'received', '2026-02-17 13:51:52.235', NULL),
(101, 'GLISSIER 45', 3000, 9, 'received', '2026-02-17 13:51:52.324', NULL),
(102, 'SUPOR TRANGLE SIMPLE 28 DORE', 10000, 9, 'received', '2026-02-17 13:51:52.414', NULL),
(103, 'SUPOR TRANGLE SIMPLE 28 CROME', 2000, 9, 'received', '2026-02-17 13:51:52.502', NULL),
(104, 'SUPOR TRANGLE SIMPLE 16 CROME', 25000, 9, 'received', '2026-02-17 13:51:52.589', NULL),
(105, 'SUPOR TRANGLE SIMPLE DOUBLE CROME 16', 9000, 9, 'received', '2026-02-17 13:51:52.677', NULL),
(106, 'SUPOR TRANGLE SIMPLE DOUBLE DORE 28', 6000, 9, 'received', '2026-02-17 13:51:52.765', NULL),
(107, 'SUPOR TRANGLE SIMPLE DOUBLE CROME 28', 2000, 9, 'received', '2026-02-17 13:51:52.853', NULL),
(108, 'BOUCHON TRANGLE', 12000, 9, 'received', '2026-02-17 13:51:52.941', NULL),
(109, 'FREURE DE LIE 100', 9000, 9, 'received', '2026-02-17 13:51:53.03', NULL),
(110, 'FREURE DE LIE 150', 1200, 9, 'received', '2026-02-17 13:51:53.118', NULL),
(111, 'TENDEUR FIL', 100000, 9, 'received', '2026-02-17 13:51:53.208', NULL),
(112, 'TRANGLE 1.5 DORE', 2000, 9, 'received', '2026-02-17 13:51:53.297', NULL),
(113, 'ACCESOIRE TRANGLE DORE 1.5', 2000, 9, 'received', '2026-02-17 13:51:53.388', NULL),
(114, 'TRANGLE 2 DORE', 2000, 9, 'received', '2026-02-17 13:51:53.479', NULL),
(115, 'ACCESOIRE TRANGLE DORE 2', 2000, 9, 'received', '2026-02-17 13:51:53.569', NULL),
(116, 'BURIN SUPER PLAT BARE', 3600, 9, 'received', '2026-02-17 13:51:53.658', NULL),
(117, 'POIGNEE BURIN ORANGE', 1800, 9, 'received', '2026-02-17 13:51:53.749', NULL),
(118, 'POIGNEE BURIN BLEU', 1800, 9, 'received', '2026-02-17 13:51:53.841', '凿柄（蓝黑色）'),
(119, 'TOLE RATOU BITON 40', 2500, 9, 'ordered', '2026-02-17 14:08:05.51', NULL),
(120, 'TOLE RATOU BION 50', 2500, 9, 'ordered', '2026-02-17 14:08:05.597', NULL),
(121, 'TOLE RATOU BION 60', 2500, 9, 'ordered', '2026-02-17 14:08:05.684', NULL),
(122, 'TOLE RATOU BION SUPER 40', 2500, 9, 'ordered', '2026-02-17 14:08:05.771', NULL),
(123, 'TOLE RATOU BION SUPER 50', 2500, 9, 'ordered', '2026-02-17 14:08:05.857', NULL),
(124, 'TOLE RATOU BION SUPER 60', 2500, 9, 'ordered', '2026-02-17 14:08:05.944', NULL),
(125, 'MOULE RATO BITON 40/50', 1, 5, 'ordered', '2026-02-17 14:08:06.03', NULL),
(126, 'MOULE RATO BITON 60', 1, 5, 'ordered', '2026-02-17 14:08:06.117', NULL),
(127, 'MOULE RATO BITON SUPER 40', 1, 5, 'ordered', '2026-02-17 14:08:06.204', NULL),
(128, 'MOULE RATO BITON SUPER50', 1, 5, 'ordered', '2026-02-17 14:08:06.301', NULL),
(129, 'MOULE RATO BITON SUPER 60', 1, 5, 'ordered', '2026-02-17 14:08:06.387', NULL),
(130, 'MOULE RATO BITON GRAVEZE', 2, 5, 'ordered', '2026-02-17 14:08:06.475', NULL),
(131, 'COLORON BLEU', 600, 9, 'ordered', '2026-02-17 14:08:06.562', NULL),
(132, 'COLORON ORANGE', 600, 9, 'ordered', '2026-02-17 14:08:06.647', NULL),
(133, 'TOLE PELLE ZINO 27', 31000, 9, 'ordered', '2026-02-17 14:18:41.689', NULL),
(134, 'COULOURANT ORANGE', 1000, 9, 'ordered', '2026-02-17 14:18:41.781', NULL),
(135, 'COULOURANT BLEU', 1000, 9, 'received', '2026-02-17 16:11:56.394', NULL),
(136, 'PLASTIC CARTE AB PM', 200000, 9, 'ordered', '2026-02-17 14:24:09.703', NULL),
(137, 'PLASTIC CARTE AB GM', 50000, 9, 'ordered', '2026-02-17 14:24:09.789', NULL),
(138, 'BOUTAI SUPER GLEU 3', 100000, 9, 'ordered', '2026-02-17 14:24:09.875', NULL),
(139, 'BOUTAI SUPER GLEU 8', 300000, 9, 'ordered', '2026-02-17 14:24:09.961', NULL),
(140, 'TICKET SUPER GLEU', 400000, 9, 'ordered', '2026-02-17 14:24:10.047', NULL),
(141, 'BOITTE COLE FAR 100', 5000, 9, 'ordered', '2026-02-17 14:24:10.133', NULL),
(142, 'BOITTE COLE FAR 135', 10000, 9, 'ordered', '2026-02-17 14:24:10.219', NULL),
(143, 'MACHINE INJECTION PLASTIC 579G', 2, 5, 'ordered', '2026-02-17 14:32:02.913', NULL),
(144, 'MACHINE INJECTION PLASTIC 840G', 6, 5, 'ordered', '2026-02-17 14:32:03.002', NULL),
(145, 'MACHINE INJECTION PLASTIC 1544', 2, 5, 'ordered', '2026-02-17 14:32:03.098', NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== ORDERS =====
INSERT INTO orders (id, supplier_id, created_at, confirmed) VALUES
(1, 1, '2026-02-14 23:15:56.59337', 'confirmed'),
(2, 1, '2026-02-14 23:22:18.301675', 'confirmed'),
(3, 1, '2026-02-14 23:54:49.500408', 'confirmed'),
(4, 1, '2026-02-14 23:55:34.899948', 'confirmed'),
(5, 1, '2026-02-14 23:56:06.69747', 'confirmed'),
(6, 1, '2026-02-15 00:09:49.610755', 'confirmed'),
(7, 4, '2026-02-15 06:29:28.268549', 'confirmed'),
(8, 4, '2026-02-15 07:18:26.897926', 'confirmed'),
(9, 4, '2026-02-15 07:34:51.637016', 'confirmed'),
(10, 1, '2026-02-15 08:50:47.060408', 'confirmed'),
(11, 1, '2026-02-15 08:59:34.032048', 'confirmed'),
(12, 1, '2026-02-15 15:34:07.849788', 'confirmed'),
(13, 4, '2026-02-15 16:12:09.665492', 'confirmed'),
(14, 1, '2026-02-15 17:33:03.0465', 'confirmed'),
(15, 1, '2026-02-15 17:52:26.727146', 'confirmed'),
(16, 1, '2026-02-15 17:54:29.982129', 'confirmed'),
(17, 1, '2026-02-15 18:32:01.494849', 'confirmed'),
(18, 2, '2026-02-15 19:25:57.47972', 'confirmed'),
(19, 4, '2026-02-15 20:06:47.994192', 'confirmed'),
(20, 4, '2026-02-15 20:28:22.363717', 'confirmed'),
(21, 4, '2026-02-15 20:28:46.560925', 'confirmed'),
(22, 4, '2026-02-15 20:41:58.766041', 'confirmed'),
(23, 4, '2026-02-15 20:46:42.979903', 'confirmed'),
(24, 4, '2026-02-15 20:47:51.155227', 'confirmed'),
(25, 4, '2026-02-15 20:49:52.210558', 'confirmed'),
(26, 4, '2026-02-15 21:02:47.808061', 'confirmed'),
(27, 4, '2026-02-15 21:15:40.391893', 'confirmed'),
(28, 4, '2026-02-15 21:33:03.286401', 'confirmed'),
(29, 4, '2026-02-15 21:58:49.711538', 'confirmed'),
(30, 4, '2026-02-15 22:43:05.019541', 'confirmed'),
(31, 4, '2026-02-16 09:02:59.14923', 'confirmed'),
(32, 4, '2026-02-16 20:08:14.738469', 'confirmed'),
(33, 5, '2026-02-17 13:50:16.341891', 'confirmed'),
(34, 1, '2026-02-17 14:08:05.399641', 'confirmed'),
(35, 6, '2026-02-17 14:18:41.597332', 'confirmed'),
(36, 7, '2026-02-17 14:24:09.62624', 'confirmed'),
(37, 8, '2026-02-17 14:32:02.833697', 'confirmed')
ON CONFLICT (id) DO NOTHING;

-- ===== ORDER ITEMS =====
INSERT INTO order_items (id, order_id, product_id, quantity_requested, quantity_ordered, price, currency) VALUES
(57, 33, 83, 0, 2600, 0, 'CNY'),
(58, 33, 84, 7000, 7000, 0, 'CNY'),
(59, 33, 85, 4940, 4940, 0, 'CNY'),
(60, 33, 86, 10000, 10000, 0, 'CNY'),
(61, 33, 87, 10000, 10000, 0, 'CNY'),
(62, 33, 88, 900, 900, 0, 'CNY'),
(63, 33, 89, 2300, 2300, 0, 'CNY'),
(64, 33, 90, 1, 1, 0, 'CNY'),
(65, 33, 91, 11000, 11000, 0, 'CNY'),
(66, 33, 92, 6000, 6000, 0, 'CNY'),
(67, 33, 93, 2000, 2000, 0, 'CNY'),
(68, 33, 94, 12000, 12000, 0, 'CNY'),
(69, 33, 95, 7425, 7425, 0, 'CNY'),
(70, 33, 96, 5865, 5865, 0, 'CNY'),
(71, 33, 97, 7097, 7097, 0, 'CNY'),
(72, 33, 98, 10000, 10000, 0, 'CNY'),
(73, 33, 99, 10000, 10000, 0, 'CNY'),
(74, 33, 100, 5000, 5000, 0, 'CNY'),
(75, 33, 101, 3000, 3000, 0, 'CNY'),
(76, 33, 102, 10000, 10000, 0, 'CNY'),
(77, 33, 103, 2000, 2000, 0, 'CNY'),
(78, 33, 104, 25000, 25000, 0, 'CNY'),
(79, 33, 105, 9000, 9000, 0, 'CNY'),
(80, 33, 106, 6000, 6000, 0, 'CNY'),
(81, 33, 107, 2000, 2000, 0, 'CNY'),
(82, 33, 108, 12000, 12000, 0, 'CNY'),
(83, 33, 109, 9000, 9000, 0, 'CNY'),
(84, 33, 110, 1200, 1200, 0, 'CNY'),
(85, 33, 111, 100000, 100000, 0, 'CNY'),
(86, 33, 112, 2000, 2000, 0, 'CNY'),
(87, 33, 113, 2000, 2000, 0, 'CNY'),
(88, 33, 114, 2000, 2000, 0, 'CNY'),
(89, 33, 115, 2000, 2000, 0, 'CNY'),
(90, 33, 116, 3600, 3600, 0, 'CNY'),
(91, 33, 117, 1800, 1800, 0, 'CNY'),
(92, 33, 118, 1800, 1800, 0, 'CNY'),
(93, 34, 119, 2500, 2500, 2.8, 'CNY'),
(94, 34, 120, 2500, 2500, 3.3, 'CNY'),
(95, 34, 121, 2500, 2500, 3.9, 'CNY'),
(96, 34, 122, 2500, 2500, 3.5, 'CNY'),
(97, 34, 123, 2500, 2500, 4.55, 'CNY'),
(98, 34, 124, 2500, 2500, 4.95, 'CNY'),
(99, 34, 125, 1, 1, 6600, 'CNY'),
(100, 34, 126, 1, 1, 7000, 'CNY'),
(101, 34, 127, 1, 1, 6800, 'CNY'),
(102, 34, 128, 1, 1, 7400, 'CNY'),
(103, 34, 129, 1, 1, 8500, 'CNY'),
(104, 34, 130, 1, 2, 1500, 'CNY'),
(105, 34, 131, 600, 600, 18, 'CNY'),
(106, 34, 132, 600, 600, 18, 'CNY'),
(107, 35, 133, 31000, 31000, 3.68, 'CNY'),
(108, 35, 134, 1000, 1000, 17.8, 'CNY'),
(109, 35, 135, 1000, 1000, 16.9, 'CNY'),
(110, 36, 136, 200000, 200000, 0.034, 'CNY'),
(111, 36, 137, 50000, 50000, 0.06, 'CNY'),
(112, 36, 138, 100000, 100000, 0.098, 'CNY'),
(113, 36, 139, 300000, 300000, 0.115, 'CNY'),
(114, 36, 140, 400000, 400000, 0.02, 'CNY'),
(115, 36, 141, 5000, 5000, 0, 'CNY'),
(116, 36, 142, 10000, 10000, 0, 'CNY'),
(117, 37, 143, 2, 2, 26000, 'USD'),
(118, 37, 144, 6, 6, 29000, 'USD'),
(119, 37, 145, 2, 2, 44000, 'USD')
ON CONFLICT (id) DO NOTHING;

-- ===== DELIVERIES =====
INSERT INTO deliveries (id, order_id, supplier_id, warehouse_id, created_at) VALUES
(1, NULL, 1, 1, '2026-02-14 23:24:47.611285'),
(2, NULL, 1, 1, '2026-02-14 23:58:38.254867'),
(3, NULL, 4, 1, '2026-02-15 06:31:02.78927'),
(4, NULL, 4, 1, '2026-02-15 07:19:08.599313'),
(5, NULL, 4, 1, '2026-02-15 07:35:30.338582'),
(6, NULL, 1, 1, '2026-02-15 09:01:17.325048'),
(7, NULL, 1, 1, '2026-02-15 15:35:49.634418'),
(8, NULL, 1, 1, '2026-02-15 17:35:22.495506'),
(9, NULL, 4, 1, '2026-02-15 20:14:25.591025'),
(10, NULL, 4, 1, '2026-02-15 20:51:10.834973'),
(11, NULL, 4, 1, '2026-02-15 21:16:26.828829'),
(12, NULL, 4, 1, '2026-02-15 22:01:59.173127'),
(13, NULL, 4, 1, '2026-02-15 22:42:24.670752'),
(14, NULL, 4, 1, '2026-02-16 09:04:01.863457'),
(15, NULL, 4, 1, '2026-02-16 09:24:07.859811'),
(16, NULL, 4, 1, '2026-02-16 20:09:06.994582'),
(17, NULL, 5, 1, '2026-02-17 13:51:50.590686'),
(18, NULL, 6, 2, '2026-02-17 16:11:56.297792')
ON CONFLICT (id) DO NOTHING;

-- ===== DELIVERY ITEMS =====
INSERT INTO delivery_items (id, delivery_id, product_id, quantity, price, currency, length, width, height, weight, pieces_per_carton) VALUES
(46, 17, 83, 2600, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(47, 17, 84, 7000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(48, 17, 85, 4940, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(49, 17, 86, 10000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(50, 17, 87, 10000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(51, 17, 88, 900, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(52, 17, 89, 2300, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(53, 17, 90, 1, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(54, 17, 91, 11000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(55, 17, 92, 6000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(56, 17, 93, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(57, 17, 94, 12000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(58, 17, 95, 7425, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(59, 17, 96, 5865, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(60, 17, 97, 7097, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(61, 17, 98, 10000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(62, 17, 99, 10000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(63, 17, 100, 5000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(64, 17, 101, 3000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(65, 17, 102, 10000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(66, 17, 103, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(67, 17, 104, 25000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(68, 17, 105, 9000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(69, 17, 106, 6000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(70, 17, 107, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(71, 17, 108, 12000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(72, 17, 109, 9000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(73, 17, 110, 1200, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(74, 17, 111, 100000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(75, 17, 112, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(76, 17, 113, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(77, 17, 114, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(78, 17, 115, 2000, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(79, 17, 116, 3600, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(80, 17, 117, 1800, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(81, 17, 118, 1800, 0, 'CNY', NULL, NULL, NULL, NULL, NULL),
(82, 18, 135, 1000, 16.9, 'CNY', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== CONTAINERS =====
INSERT INTO containers (id, invoice_number, container_number, shipping_company, warehouse_id, status, created_at, shipping_company_id, price_cny, price_usd) VALUES
(1, '1305', ',jgvjhg,nvh,', 'cma', 1, 'arrived', '2026-02-14 23:25:52.212255', NULL, 0, 0),
(2, '103', 'jkljklhkjhkhj', '', 3, 'arrived', '2026-02-15 06:33:16.801871', NULL, 0, 0),
(3, '120', '16', 'magie', 1, 'arrived', '2026-02-15 17:28:50.685607', 1, 4500, 5000),
(4, '120', '33', 'magie', 1, 'arrived', '2026-02-15 18:32:43.752059', 1, 21, 120),
(5, '103', '2215', 'magie', 1, 'arrived', '2026-02-15 20:19:18.230791', 1, 4200, 3500),
(6, '202507', '1254', 'magie', 1, 'arrived', '2026-02-15 21:21:42.062954', 1, 3200, 3100),
(7, '202507', 'KHJK', 'magie', 1, 'arrived', '2026-02-15 21:22:22.450296', 1, 2100, 4500),
(8, '202507', '120', 'magie', 1, 'arrived', '2026-02-15 21:22:40.667255', 1, 3100, 4500),
(9, '202601', 'VNB?N', 'magie', 1, 'arrived', '2026-02-15 22:04:50.450154', 1, 2100, 4100),
(10, '202601', 'BGFNGF', 'magie', 1, 'arrived', '2026-02-15 22:08:03.144253', 1, 3100, 2500),
(11, '202601', 'BFDFDG', 'magie', 1, 'arrived', '2026-02-15 22:32:58.757857', 1, 44, 44),
(12, '202601', 'JHGGJGJ', 'magie', 1, 'arrived', '2026-02-16 09:06:05.152268', 1, 2500, 3200),
(13, '202601', 'Vfgfg', 'magie', 1, 'arrived', '2026-02-16 20:12:20.136663', 1, 3200, 4109)
ON CONFLICT (id) DO NOTHING;

-- ===== CONTAINER DOCUMENTS =====
INSERT INTO container_documents (id, container_id, invoice_number, invoice_date, shipping_bill, origin_certificate, conformity_certificate, invoice, money_arrival, money_arrival_currency, cashbox_transaction_id, created_at, group_invoice_id) VALUES
(1, 5, '103', '2026-02-15 20:19:18.56', true, true, true, 25500, 25450, 'USD', 7, '2026-02-15 20:19:18.575719', NULL),
(2, 6, '202507', '2026-02-15 21:21:42.312', true, true, true, 100, 100, 'CNY', 8, '2026-02-15 21:21:42.327328', NULL),
(3, 7, '202507', '2026-02-15 21:22:22.563', true, true, true, NULL, 1100, 'CNY', 13, '2026-02-15 21:22:22.580242', NULL),
(4, 8, '202507', '2026-02-15 21:22:40.78', true, true, true, NULL, 100, 'CNY', 12, '2026-02-15 21:22:40.796216', NULL),
(5, 9, '202601', '2026-02-15 22:04:50.694', true, true, true, NULL, 100, 'CNY', 11, '2026-02-15 22:04:50.709389', NULL),
(6, 10, '202601', '2026-02-15 22:08:03.38', true, true, true, 100, 100, 'CNY', 9, '2026-02-15 22:08:03.395091', 6),
(7, 11, '202601', '2026-02-15 22:32:58.942', true, true, true, NULL, 100, 'CNY', 10, '2026-02-15 22:32:58.957547', NULL),
(8, 12, '202601', '2026-02-16 09:06:05.469', true, true, true, NULL, NULL, 'CNY', NULL, '2026-02-16 09:06:05.484333', 6),
(9, 13, '202601', '2026-02-16 20:12:20.523', true, true, true, 2500, 24450, 'CNY', 18, '2026-02-16 20:12:20.537789', 6)
ON CONFLICT (id) DO NOTHING;

-- ===== PAYMENTS =====
INSERT INTO payments (id, supplier_id, amount, currency, note, created_at) VALUES
(14, 1, 8108, 'CNY', '', '2026-02-17 14:08:42.284124'),
(15, 6, 50000, 'CNY', '', '2026-02-17 14:20:53.855772')
ON CONFLICT (id) DO NOTHING;

-- ===== SHIPPING PAYMENTS =====
INSERT INTO shipping_payments (id, shipping_company_id, amount, currency, note, created_at) VALUES
(3, 1, 28065, 'CNY', '', '2026-02-17 13:14:28.279479'),
(4, 1, 34673, 'USD', '', '2026-02-17 13:14:41.255386')
ON CONFLICT (id) DO NOTHING;

-- ===== CASHBOX TRANSACTIONS =====
INSERT INTO cashbox_transactions (id, type, category, amount, currency, supplier_id, shipping_company_id, description, created_at, payment_id, shipping_payment_id, expense_id) VALUES
(7, 'income', 'other', 25450, 'USD', NULL, NULL, 'وصول أموال - فاتورة رقم 103', '2026-02-15 20:19:18.575719', NULL, NULL, NULL),
(8, 'income', 'other', 100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202507', '2026-02-15 21:21:42.327328', NULL, NULL, NULL),
(9, 'income', 'other', 100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202601', '2026-02-15 22:08:03.395091', NULL, NULL, NULL),
(10, 'income', 'other', 100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202601', '2026-02-15 22:32:58.957547', NULL, NULL, NULL),
(11, 'income', 'other', 100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202601', '2026-02-15 22:04:50.709389', NULL, NULL, NULL),
(12, 'income', 'other', 100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202507', '2026-02-15 21:22:40.796216', NULL, NULL, NULL),
(13, 'income', 'other', 1100, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202507', '2026-02-15 21:22:22.580242', NULL, NULL, NULL),
(18, 'income', 'other', 24450, 'CNY', NULL, NULL, 'وصول أموال - فاتورة رقم 202601', '2026-02-16 20:12:20.537789', NULL, NULL, NULL),
(20, 'expense', 'shipping', 28065, 'CNY', NULL, 1, 'دفعة لشركة الشحن: magie', '2026-02-17 13:14:28.349486', NULL, 3, NULL),
(21, 'expense', 'shipping', 34673, 'USD', NULL, 1, 'دفعة لشركة الشحن: magie', '2026-02-17 13:14:41.319567', NULL, 4, NULL),
(22, 'expense', 'supplier', 8108, 'CNY', 1, NULL, 'دفعة للمورد: BALA 1 LILI', '2026-02-17 14:08:42.352158', 14, NULL, NULL),
(23, 'expense', 'supplier', 50000, 'CNY', 6, NULL, 'دفعة للمورد: USINE PELLE 2 EVA', '2026-02-17 14:20:53.923345', 15, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ===== USER CATEGORIES =====
INSERT INTO user_categories (id, user_id, category_id) VALUES
(2, 3, 4),
(3, 2, 4),
(4, 2, 1),
(5, 2, 2),
(6, 2, 3),
(7, 2, 5),
(8, 2, 6),
(9, 2, 9)
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM categories));
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM suppliers));
SELECT setval('warehouses_id_seq', (SELECT COALESCE(MAX(id), 0) FROM warehouses));
SELECT setval('shipping_companies_id_seq', (SELECT COALESCE(MAX(id), 0) FROM shipping_companies));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products));
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orders));
SELECT setval('order_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM order_items));
SELECT setval('deliveries_id_seq', (SELECT COALESCE(MAX(id), 0) FROM deliveries));
SELECT setval('delivery_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM delivery_items));
SELECT setval('containers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM containers));
SELECT setval('container_documents_id_seq', (SELECT COALESCE(MAX(id), 0) FROM container_documents));
SELECT setval('payments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM payments));
SELECT setval('shipping_payments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM shipping_payments));
SELECT setval('cashbox_transactions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM cashbox_transactions));
SELECT setval('user_categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM user_categories));
