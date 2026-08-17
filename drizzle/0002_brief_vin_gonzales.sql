CREATE TABLE `external_market_signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`externalReference` varchar(255) NOT NULL,
	`evidenceUrl` varchar(500),
	`signalType` enum('shortage','rare_medicine','demand') NOT NULL,
	`drugId` int,
	`freeTextName` varchar(200),
	`governorateId` int,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`confidence` int NOT NULL DEFAULT 0,
	`summary` text NOT NULL,
	`observedAt` timestamp NOT NULL,
	`reviewStatus` enum('pending','approved','rejected','auto_approved') NOT NULL DEFAULT 'pending',
	`reviewedByUserId` int,
	`reviewNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_market_signals_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_signal_reference_idx` UNIQUE(`sourceId`,`externalReference`)
);
--> statement-breakpoint
CREATE TABLE `external_market_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`platform` enum('telegram','facebook','website','other') NOT NULL,
	`sourceUrl` varchar(500) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`autoApproveSignals` boolean NOT NULL DEFAULT false,
	`createdByUserId` int NOT NULL,
	`lastCheckedAt` timestamp,
	`lastSucceededAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_market_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_source_url_idx` UNIQUE(`sourceUrl`)
);
--> statement-breakpoint
ALTER TABLE `external_market_signals` ADD CONSTRAINT `external_market_signals_sourceId_external_market_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `external_market_sources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `external_market_signals` ADD CONSTRAINT `external_market_signals_drugId_drugs_id_fk` FOREIGN KEY (`drugId`) REFERENCES `drugs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `external_market_signals` ADD CONSTRAINT `external_market_signals_governorateId_governorates_id_fk` FOREIGN KEY (`governorateId`) REFERENCES `governorates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `external_market_signals` ADD CONSTRAINT `external_market_signals_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `external_market_sources` ADD CONSTRAINT `external_market_sources_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `external_signal_review_idx` ON `external_market_signals` (`reviewStatus`);--> statement-breakpoint
CREATE INDEX `external_signal_source_idx` ON `external_market_signals` (`sourceId`);--> statement-breakpoint
CREATE INDEX `external_signal_governorate_idx` ON `external_market_signals` (`governorateId`);--> statement-breakpoint
CREATE INDEX `external_signal_observed_idx` ON `external_market_signals` (`observedAt`);--> statement-breakpoint
CREATE INDEX `external_source_active_idx` ON `external_market_sources` (`isActive`);--> statement-breakpoint
CREATE INDEX `external_source_platform_idx` ON `external_market_sources` (`platform`);