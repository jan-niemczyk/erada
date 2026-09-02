-- phpMyAdmin SQL Dump
-- version 4.6.6deb4+deb9u1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Czas generowania: 25 Kwi 2021, 14:20
-- Wersja serwera: 10.3.27-MariaDB-0+deb10u1
-- Wersja PHP: 7.0.33-0+deb9u8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `erada`
--
CREATE DATABASE IF NOT EXISTS `erada` DEFAULT CHARACTER SET utf8 COLLATE utf8_polish_ci;
USE `erada`;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `configs`
--

CREATE TABLE `configs` (
  `key` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `value` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Zrzut danych tabeli `configs`
--

INSERT INTO `configs` (`key`, `value`, `updated_at`, `created_at`) VALUES
('jednostka', 'Rada', '2021-04-25 12:05:49', '2021-04-25 06:05:01'),
('navbar_background', 'bg-success', '2021-04-25 12:07:14', '2021-04-25 06:05:01'),
('navbar_theme', 'navbar-dark\n', '2021-04-25 12:05:49', '2021-04-25 06:05:01');

-- --------------------------------------------------------

--
-- Zastąpiona struktura widoku `constituency_localities`
-- (See below for the actual view)
--
CREATE TABLE `constituency_localities` (
`constituency` int(11)
,`locality_name` varchar(25)
);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `constituency_ward`
--

CREATE TABLE `constituency_ward` (
  `id` int(11) NOT NULL,
  `constituency` int(11) NOT NULL,
  `ward` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `councillors`
--

CREATE TABLE `councillors` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `constituency` int(11) NOT NULL,
  `terms_id` int(11) NOT NULL,
  `committee` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `users_id` int(11) UNSIGNED NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `localities`
--

CREATE TABLE `localities` (
  `id` int(11) NOT NULL,
  `name` varchar(25) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `localities_constituency_ward`
--

CREATE TABLE `localities_constituency_ward` (
  `id` int(10) UNSIGNED NOT NULL,
  `constituency_ward_id` int(11) NOT NULL,
  `localities_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `logs`
--

CREATE TABLE `logs` (
  `id` int(11) UNSIGNED NOT NULL,
  `value` text CHARACTER SET utf8 NOT NULL,
  `login` varchar(30) CHARACTER SET utf8 NOT NULL,
  `cretated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `sittings`
--

CREATE TABLE `sittings` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'uuid()',
  `number` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `date` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `term_id` int(11) UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `sittings_presence`
--

CREATE TABLE `sittings_presence` (
  `id` int(11) NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `sittings_id` int(11) UNSIGNED NOT NULL,
  `councillors_id` int(11) UNSIGNED NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `terms`
--

CREATE TABLE `terms` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `start_date` varchar(12) COLLATE utf8_unicode_ci NOT NULL,
  `end_date` varchar(12) COLLATE utf8_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `surname` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `role` varchar(5) COLLATE utf8_unicode_ci NOT NULL,
  `can_vote` tinyint(1) NOT NULL,
  `remember_token` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`id`, `uuid`, `name`, `surname`, `email`, `password`, `role`, `can_vote`, `remember_token`, `updated_at`, `created_at`) VALUES
(32, '2c5f8bdd-a5b5-11eb-b01d-ede7bdfdbebe', 'Jan', 'Niemczyk', 'admin@admin.pl', '$2a$10$sB3DUlIJ1A.IO9PQ1GWIzexZU16Qes53EF5s//W3fIOwj5Fa8hf9S', 'admin', 0, NULL, '2021-04-25 12:03:20', '2021-04-25 06:05:01');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `vote_types`
--

CREATE TABLE `vote_types` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `votings`
--

CREATE TABLE `votings` (
  `id` int(11) UNSIGNED NOT NULL,
  `uuid` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `name` text COLLATE utf8_unicode_ci NOT NULL,
  `queue` int(11) NOT NULL,
  `sitting_id` int(11) UNSIGNED NOT NULL,
  `vote_type_id` int(11) UNSIGNED NOT NULL,
  `active` tinyint(1) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `votings_results`
--

CREATE TABLE `votings_results` (
  `id` int(11) NOT NULL,
  `councillors_id` int(11) UNSIGNED NOT NULL,
  `votings_id` int(11) UNSIGNED NOT NULL,
  `result` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura widoku `constituency_localities`
--
DROP TABLE IF EXISTS `constituency_localities`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `constituency_localities`  AS  select `cw`.`constituency` AS `constituency`,`l`.`name` AS `locality_name` from ((`constituency_ward` `cw` join `localities_constituency_ward` `lcw` on(`cw`.`id` = `lcw`.`constituency_ward_id`)) join `localities` `l` on(`lcw`.`localities_id` = `l`.`id`)) group by `cw`.`constituency`,`l`.`name` ;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indexes for table `configs`
--
ALTER TABLE `configs`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `constituency_ward`
--
ALTER TABLE `constituency_ward`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `constituency` (`constituency`,`ward`);

--
-- Indexes for table `councillors`
--
ALTER TABLE `councillors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `councillors_ibfk_1` (`users_id`);

--
-- Indexes for table `localities`
--
ALTER TABLE `localities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `localities_constituency_ward`
--
ALTER TABLE `localities_constituency_ward`
  ADD PRIMARY KEY (`id`),
  ADD KEY `localities_constituency_ward_ibfk_1` (`constituency_ward_id`),
  ADD KEY `localities_constituency_ward_ibfk_2` (`localities_id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sittings`
--
ALTER TABLE `sittings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`),
  ADD KEY `id_2` (`id`),
  ADD KEY `sittings_ibfk_1` (`term_id`);

--
-- Indexes for table `sittings_presence`
--
ALTER TABLE `sittings_presence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sittings_presence_ibfk_1` (`sittings_id`),
  ADD KEY `sittings_presence_ibfk_2` (`councillors_id`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `terms_id_unique` (`id`),
  ADD KEY `id` (`id`),
  ADD KEY `id_2` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `vote_types`
--
ALTER TABLE `vote_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`);

--
-- Indexes for table `votings`
--
ALTER TABLE `votings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id` (`id`),
  ADD KEY `votings_ibfk_1` (`sitting_id`),
  ADD KEY `votings_ibfk_2` (`vote_type_id`);

--
-- Indexes for table `votings_results`
--
ALTER TABLE `votings_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `one_vote` (`councillors_id`,`votings_id`),
  ADD KEY `votings_results_ibfk_2` (`votings_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT dla tabeli `constituency_ward`
--
ALTER TABLE `constituency_ward`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT dla tabeli `councillors`
--
ALTER TABLE `councillors`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT dla tabeli `localities`
--
ALTER TABLE `localities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;
--
-- AUTO_INCREMENT dla tabeli `localities_constituency_ward`
--
ALTER TABLE `localities_constituency_ward`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;
--
-- AUTO_INCREMENT dla tabeli `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;
--
-- AUTO_INCREMENT dla tabeli `sittings`
--
ALTER TABLE `sittings`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT dla tabeli `sittings_presence`
--
ALTER TABLE `sittings_presence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
--
-- AUTO_INCREMENT dla tabeli `terms`
--
ALTER TABLE `terms`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
--
-- AUTO_INCREMENT dla tabeli `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
--
-- AUTO_INCREMENT dla tabeli `vote_types`
--
ALTER TABLE `vote_types`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT dla tabeli `votings`
--
ALTER TABLE `votings`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
--
-- AUTO_INCREMENT dla tabeli `votings_results`
--
ALTER TABLE `votings_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;
--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `councillors`
--
ALTER TABLE `councillors`
  ADD CONSTRAINT `councillors_ibfk_1` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `localities_constituency_ward`
--
ALTER TABLE `localities_constituency_ward`
  ADD CONSTRAINT `localities_constituency_ward_ibfk_1` FOREIGN KEY (`constituency_ward_id`) REFERENCES `constituency_ward` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `localities_constituency_ward_ibfk_2` FOREIGN KEY (`localities_id`) REFERENCES `localities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `sittings`
--
ALTER TABLE `sittings`
  ADD CONSTRAINT `sittings_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `sittings_presence`
--
ALTER TABLE `sittings_presence`
  ADD CONSTRAINT `sittings_presence_ibfk_1` FOREIGN KEY (`sittings_id`) REFERENCES `sittings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sittings_presence_ibfk_2` FOREIGN KEY (`councillors_id`) REFERENCES `councillors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `votings`
--
ALTER TABLE `votings`
  ADD CONSTRAINT `votings_ibfk_1` FOREIGN KEY (`sitting_id`) REFERENCES `sittings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `votings_ibfk_2` FOREIGN KEY (`vote_type_id`) REFERENCES `vote_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `votings_results`
--
ALTER TABLE `votings_results`
  ADD CONSTRAINT `votings_results_ibfk_1` FOREIGN KEY (`councillors_id`) REFERENCES `councillors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `votings_results_ibfk_2` FOREIGN KEY (`votings_id`) REFERENCES `votings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
