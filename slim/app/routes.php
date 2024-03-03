<?php

declare(strict_types=1);

use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Services\Functions;

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
            'Images' => $imagesString,
            'ListingType' => $data['ListingType'],
            'ListingLocation' => $data['ListingLocation'],
            'ListingDate' => $data['ListingDate'],
        ]);

        // Return a JSON response indicating success
        $responseData = ['message' => 'Listing created successfully'];
        $response->getBody()->write(json_encode($responseData));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });

    $app->post('/SignUpUser', function (Request $request, Response $response) {
        try {
            // Access JSON request data
            $data = $request->getParsedBody();
    
            $pictureName = $_FILES['profilePic']['name'];
         
            
    
            // Get the Capsule instance from the container
            $capsule = $this->get(Capsule::class);
    
            // Insert data into 'siteuser' table
            $capsule->table('siteuser')->insert([
                'FirstName' => $data['firstName'],
                'LastName' => $data['lastName'],
                'Email' => $data['email'],
                'Password' => $data['password'],
                'License' => $data['license'],
                'ProfileType' => $data['ProfileType'],
                'ProfilePicture' =>$pictureName,
            ]);
    
            // Return a JSON response indicating success
            $responseData = ['message' => 'Site User Signup Successful'];
            $response->getBody()->write(json_encode($responseData));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            // Log the error
            error_log($e->getMessage());
    
            // Return a JSON response indicating failure
            $errorResponse = ['error' => 'Internal Server Error'];
            $response->getBody()->write(json_encode($errorResponse));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    });

    
    $app->post('/uploadprofilepic', function (Request $request, Response $response) {
        try {
            $uploadedFile = $request->getUploadedFiles()['profilePic'];
    
            // Debugging output
            $filename = $uploadedFile->getClientFilename();
            error_log('Received file: ' . $filename);

            $destinationPath = '../../reactapp/public/ProfilePhotos/';

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }

            $uploadedFile->moveTo($destinationPath . $filename);
    
            error_log('File moved successfully to: ' . $destinationPath . $filename);
    
            // Respond with a JSON success message
            $response->getBody()->write(json_encode(['message' => 'File uploaded successfully']));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            // Log the error
            error_log('Error: ' . $e->getMessage());
    
            // Respond with a JSON error message
            $response->getBody()->write(json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    });



    $app->post('/reset-password', function (Request $request, Response $response, array $args) {
        $data = $request->getParsedBody();

        // Create an instance of the Functions class
        $functions = new Functions();

        // Check if the email exists in your database
        $userExists = $functions->checkIfUserExists($data['email']);

        if ($userExists) {
            // Generate a unique token for password reset
            $resetToken = $functions->generateResetToken();

            // Save the token in your database
            $saveResult = $functions->saveResetToken($data['email'], $resetToken);

            if ($saveResult) {
                // Send an email with the reset link
                $emailResult = $functions->sendResetEmail($data['email'], $resetToken);

                if ($emailResult) {
                    $response->getBody()->write(json_encode(['message' => 'A password reset email was sent to '. $data['email']]));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
                } else {
                    // Return an error response for email sending failure
                    $response->getBody()->write(json_encode(['error' => 'Failed to send password reset email']));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
                }
            } else {
                // Return an error response for token saving failure
                $response->getBody()->write(json_encode(['error' => 'Failed to save password reset token']));
                return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
            }
        } else {
            // Return an error response for user not found
            $response->getBody()->write(json_encode(['error' => 'Email not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
    });

    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });
};