-- MySQL dump-style schema and data.

/*!40101 SET NAMES utf8mb4 */;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) unsigned NOT NULL,
  `status` enum('new','paid','shipped') NOT NULL DEFAULT 'new',
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  UNIQUE KEY `uniq_note` (`note`(64)),
  CONSTRAINT `fk_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COMMENT='customer orders';

INSERT INTO `orders` (`customer_id`, `status`, `total`) VALUES (1, 'new', 9.99), (2, 'paid', 120.00)
  ON DUPLICATE KEY UPDATE `total` = VALUES(`total`);

INSERT IGNORE INTO tags SET name = 'sale', created_at = NOW();
REPLACE INTO settings (k, v) VALUES ('theme', 'dark');

SELECT o.id, c.name, IF(o.total > 100, 'big', 'small') AS size,
       GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS tags
FROM orders o
  STRAIGHT_JOIN customers c ON c.id = o.customer_id
  LEFT JOIN order_tags ot USING (order_id)
  LEFT JOIN tags t FORCE INDEX (PRIMARY) ON t.id = ot.tag_id
WHERE o.created_at >= CURDATE() AND @min_total <= o.total
GROUP BY o.id WITH ROLLUP
ORDER BY o.total DESC
LIMIT 10, 20;

UPDATE orders SET status = 'shipped' WHERE status = 'paid' ORDER BY created_at LIMIT 100;
DELETE FROM sessions WHERE expires_at < NOW() LIMIT 1000;

ALTER TABLE orders ADD COLUMN discount decimal(5,2) DEFAULT NULL AFTER total, ENGINE = InnoDB;
SET @@session.sql_mode = 'STRICT_TRANS_TABLES', @rows := 0;
SHOW CREATE TABLE orders;
DESCRIBE orders;
USE shop;
SET FOREIGN_KEY_CHECKS = 1;
