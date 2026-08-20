CREATE TABLE `therapeutic_search_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('antibiotics','analgesics','cardiovascular','respiratory','gastrointestinal','neurological','endocrine','antifungal','antiviral','oncology','dermatological','ophthalmological','vitamins','other') NOT NULL,
	`context` enum('catalog','offer','request') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `therapeutic_search_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `therapeutic_search_category_created_idx` ON `therapeutic_search_events` (`category`,`createdAt`);--> statement-breakpoint
CREATE INDEX `therapeutic_search_created_idx` ON `therapeutic_search_events` (`createdAt`);