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

    $app->add('cors');
    $app->post('/listings', [\App\ListingController::class, 'createListing']);


    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write('Stein Kayuni');
        return $response;
    });

    
    $app->get('/siteuser', function (Request $request, Response $response) {
        // Get the Capsule instance from the container
        $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);
    
       
        $agents = $capsule->table('siteuser')->get();
    
        $response->getBody()->write(json_encode($agents));
        return $response->withHeader('Content-Type', 'application/json');
    });  
       
    $app->get('/listingsmade', function (Request $request, Response $response) {
        // Get the Capsule instance from the container
        $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);
    
        // Fetch users from the 'siteusers' table
        $listingsmade = $capsule->table('listings')->get();
    
        // Convert agents to JSON and send the response
        $response->getBody()->write(json_encode($listingsmade));
        return $response->withHeader('Content-Type', 'application/json');
    });  
    
    $app->post('/PostListing', function (Request $request, Response $response) {
        // Access request data
        $data = $request->getParsedBody();

        // Get the Capsule instance from the container
        $capsule = $this->get(Capsule::class);
        $imagesString = json_encode($data['images']);

        // Insert data into 'listings' table
        $capsule->table('listings')->insert([
            'Lister' => $data['Lister'],
            'ListingId' => $data['ListingId'],
            'ListingDescription' => $data['description'],
            'Images' => $imagesString ,
            'ListingType' => $data['ListingType'],
            'ListingLocation' => $data['ListingLocation'],
            'ListingDate' => $data['ListingDate'],
        ]);

        // Return a JSON response indicating success
        $responseData = ['message' => 'Listing created successfully'];
        $response->getBody()->write(json_encode($responseData));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });



    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });
};
