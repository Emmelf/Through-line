<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:db:flush', description: 'Flush all users from the database (for testing)')]
class FlushDatabaseCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->warning('This will delete ALL users from the database!');
        if (!$io->confirm('Are you sure you want to continue?', false)) {
            $io->info('Cancelled.');
            return Command::SUCCESS;
        }

        try {
            $connection = $this->entityManager->getConnection();
            // Intentionally delete all users for testing/flushing
            /** @noinspection SqlWithoutWhere, SqlResolve */
            $connection->executeStatement('DELETE FROM `user`');
            $io->success('All users deleted successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Error deleting users: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
