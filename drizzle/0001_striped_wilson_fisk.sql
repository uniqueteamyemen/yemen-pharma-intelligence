CREATE TABLE `drug_trade_names` (
	`id` int AUTO_INCREMENT NOT NULL,
	`drugId` int,
	`tradeName` varchar(200) NOT NULL,
	`tradeNameAr` varchar(200),
	`scientificName` varchar(200) NOT NULL,
	`activeIngredients` text NOT NULL,
	`dosageForm` varchar(100),
	`package` varchar(255),
	`manufacturer` varchar(200),
	`manufacturerCountry` varchar(100),
	`sourceDocument` varchar(255) NOT NULL,
	`sourcePage` int,
	`sourceRow` int,
	`sourceYears` varchar(20) NOT NULL,
	`sourceKey` varchar(191) NOT NULL,
	`matchStatus` enum('linked','ambiguous','unlinked') NOT NULL DEFAULT 'unlinked',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drug_trade_names_id` PRIMARY KEY(`id`),
	CONSTRAINT `trade_name_source_key_idx` UNIQUE(`sourceKey`)
);
--> statement-breakpoint
ALTER TABLE `drug_trade_names` ADD CONSTRAINT `drug_trade_names_drugId_drugs_id_fk` FOREIGN KEY (`drugId`) REFERENCES `drugs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `trade_name_drug_idx` ON `drug_trade_names` (`drugId`);--> statement-breakpoint
CREATE INDEX `trade_name_name_idx` ON `drug_trade_names` (`tradeName`);--> statement-breakpoint
CREATE INDEX `trade_name_scientific_idx` ON `drug_trade_names` (`scientificName`);--> statement-breakpoint
CREATE INDEX `trade_name_status_idx` ON `drug_trade_names` (`matchStatus`);