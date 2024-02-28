<?php

declare(strict_types=1);

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;
use Illuminate\Database\Capsule\Manager as Capsule;


return function (App $app) {
    $app->options('/{routes:.*}', function (Request $request, Response $response) {
        // CORS Pre-Flight OPTIONS Request Handler
        return $response;
    });

  

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write('Stein Kayuni');
        return $response;
    });

    
    $app->get('/siteuser', function (Request $request, Response $response) {
        // Get the Capsule instance from the container
        $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);
    
        // Fetch agents from the 'agents' table
        $agents = $capsule->table('siteuser')->get();
    
        // Convert agents to JSON and send the response
        $response->getBody()->write(json_encode($agents));
        return $response->withHeader('Content-Type', 'application/json');
    });  
    

    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });
};
