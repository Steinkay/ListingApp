<?php

declare(strict_types=1);

use App\Application\Settings\SettingsInterface;
use DI\ContainerBuilder;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Monolog\Processor\UidProcessor;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use Illuminate\Database\Capsule\Manager as Capsule;
use Tuupola\Middleware\CorsMiddleware;

return function (ContainerBuilder $containerBuilder) {
    $containerBuilder->addDefinitions([
        LoggerInterface::class => function (ContainerInterface $c) {
            $settings = $c->get(SettingsInterface::class);

            $loggerSettings = $settings->get('logger');
            $logger = new Logger($loggerSettings['name']);

            $processor = new UidProcessor();
            $logger->pushProcessor($processor);

            $handler = new StreamHandler($loggerSettings['path'], $loggerSettings['level']);
            $logger->pushHandler($handler);

            return $logger;
        },

        Capsule::class => function (ContainerInterface $c) {
            $capsule = new Capsule;

            $settings = $c->get(SettingsInterface::class);
            $databaseSettings = $settings->get('database');

            $capsule->addConnection([
                'driver' => 'mysql',
                'host' => $databaseSettings['host'],
                'database' => $databaseSettings['database'],
                'username' => $databaseSettings['username'],
                'password' => $databaseSettings['password'],
                'charset' => 'utf8',
                'collation' => 'utf8_unicode_ci',
                'prefix' => '',
            ]);

            $capsule->setAsGlobal();
            $capsule->bootEloquent();

            return $capsule;
        },
        
        'cors' => function () {
            return new CorsMiddleware([
                'origin' => ['http://localhost:3000'],
                'methods' => ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
                'headers.allow' => ['Authorization', 'Content-Type'],
                'headers.expose' => [],
                'credentials' => true,
                'cache' => 0,
            ]);
        },
        'ListingController' => function () {
            return new \App\ListingController();
        },
    ]);
};