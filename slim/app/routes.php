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
        return $response;
        
    });

    $app->add(new \Tuupola\Middleware\CorsMiddleware([
        'origin' => ['http://localhost:3000'], 
        'methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'headers.allow' => ['Content-Type', 'Authorization'],
        'headers.expose' => [],
        'credentials' => true,
        'cache' => 0,
    ]));
    $app->add(function ($request, $handler) {
        error_log('CORS Middleware executed');
        return $handler->handle($request);
    });
    
    $app->post('/listings', [\App\ListingController::class, 'createListing']);

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write('Stein Kayuni');
        return $response;
    });

    //gets siteusers
    $app->get('/siteuser', function (Request $request, Response $response) {
        // Get the Capsule instance from the container
        $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);

        $agents = $capsule->table('siteuser')->get();

        $response->getBody()->write(json_encode($agents));
        return $response->withHeader('Content-Type', 'application/json');
    });

    //Sends data of listings in the database
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
    
        // Insert data into 'listings' table
        $capsule->table('listings')->insert([
            'Lister' => $data['Lister'],
            'ListingId' => $data['ListingId'],
            'ListingDescription' => $data['description'],
            'ListingType' => $data['ListingType'],
            'ListingLocation' => $data['ListingLocation'],
            'ListingDate' => $data['ListingDate'],
            'Images' => json_encode($data['images']), // Store image names as a JSON array
        ]);
    
        // Return a JSON response indicating success
        $responseData = ['message' => 'Listing created successfully'];
        $response->getBody()->write(json_encode($responseData));
    
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });

    $app->post('/SendMessages', function (Request $request, Response $response) {
        // Access request data
        $data = $request->getParsedBody();
    
        // Get the Capsule instance from the container
        $capsule = $this->get(Capsule::class);
    
        // Insert data into 'listings' table
        $capsule->table('messages')->insert([
            'MessageId' => $data['MessageId'],
            'MessageRoom' => $data['MessageRoom'],
            'SenderId' => $data['SenderId'],
            'ReceiverId' => $data['ReceiverId'],
            'MessageDetails' => $data['MessageDetails'],
            'MessageDate' => $data['MessageDate'],
            'Attachments' => json_encode($data['Attachments']), // Store image names as a JSON array
        ]);

    
        // Return a JSON response indicating success
        $responseData = ['message' => 'Listing created successfully'];
        $response->getBody()->write(json_encode($responseData));
    
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    });

    
   $app->get('/Messages', function (Request $request, Response $response) {
    // Get the Capsule instance from the container
    $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);

    // Extract userId from query parameters
    $userId = $request->getQueryParams()['userId'] ?? null;

    // Fetch messages from the 'messages' table for the specified user
    $messages = $capsule->table('messages')->where('SenderId', $userId)
                                           ->orWhere('ReceiverId', $userId)
                                           ->get();

    // Convert messages to JSON and send the response
    $response->getBody()->write(json_encode($messages));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/MessagesByRoom', function (Request $request, Response $response) {
    // Get the Capsule instance from the container
    $capsule = $this->get(\Illuminate\Database\Capsule\Manager::class);

    // Extract chatRoom from query parameters
    $chatRoom = $request->getQueryParams()['chatRoom'] ?? null;

    // Check if chatRoom parameter is provided
    if (!$chatRoom) {
        // If chatRoom is not provided, return a response with an error message
        $response->getBody()->write(json_encode(['error' => 'chatRoom parameter is required']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
    }

    // Fetch messages from the 'messages' table for the specified chatRoom
    $messages = $capsule->table('messages')->where('MessageRoom', $chatRoom)->get();

    // Convert messages to JSON and send the response
    $response->getBody()->write(json_encode($messages));
    return $response->withHeader('Content-Type', 'application/json');
});
    

    
    $app->get('/CheckChatRoom/{chatRoomId}', function (Request $request, Response $response, $args) {
        $chatRoomId = $args['chatRoomId'];
        
        // Get the Capsule instance from the container
        $capsule = $this->get(Capsule::class);
        
        // Check if a message with the provided chat room ID exists
        $message = $capsule->table('messages')
            ->where('MessageRoom', $chatRoomId)
            ->first();
        
        // Determine if the chat room exists
        $exists = $message !== null;
        
        // Respond with a JSON object indicating whether the chat room exists
        $response->getBody()->write(json_encode(['exists' => $exists]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    //Handle user signup
    $app->post('/SignUpUser', function (Request $request, Response $response) {
        try {
            // Access JSON request data
            $data = $request->getParsedBody();
    
            $pictureName = $_FILES['profilePic']['name'];
    
            // Get the Capsule instance from the container
            $capsule = $this->get(Capsule::class);
    
            // Check if 'siteuser' table exists
            if (!$capsule->schema()->hasTable('siteuser')) {
                // Create 'siteuser' table if it doesn't exist
                $capsule->schema()->create('siteuser', function ($table) {
                    $table->id(); // Auto-incremental primary key
                    $table->string('FirstName');
                    $table->string('LastName');
                    $table->string('Email');
                    $table->string('Password');
                    $table->string('License');
                    $table->string('ProfileType');
                    $table->string('ProfilePicture');
                    $table->string('Location');
                    $table->string('PasswordResetToken');
                    // Add other columns as needed
                });
            }
    
            // Insert data into 'siteuser' table
            $capsule->table('siteuser')->insert([
                'FirstName' => $data['firstName'],
                'LastName' => $data['lastName'],
                'Email' => $data['email'],
                'Password' => $data['password'],
                'License' => $data['license'],
                'ProfileType' => $data['ProfileType'],
                'ProfilePicture' => $pictureName,
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
    

    //handle profile picture upload
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

    $app->post('/listingimages', function (Request $request, Response $response) {
        try {
            $uploadedFiles = $request->getUploadedFiles()['images'];
            
            // Debugging output
            $destinationPath = '../../reactapp/public/ListingPhotos/';
    
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0777, true);
            }
    
            foreach ($uploadedFiles as $uploadedFile) {
                $filename = $uploadedFile->getClientFilename();
                error_log('Received file: ' . $filename);
    
                // Move each uploaded file to the destination path
                $uploadedFile->moveTo($destinationPath . $filename);
                
                error_log('File moved successfully to: ' . $destinationPath . $filename);
            }
    
            // Respond with a JSON success message
            $response->getBody()->write(json_encode(['message' => 'Files uploaded successfully']));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        } catch (\Exception $e) {
            // Log the error
            error_log('Error: ' . $e->getMessage());
    
            // Respond with a JSON error message
            $response->getBody()->write(json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]));
    
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
    });
    



    
    //Api created to hand password reset
    $app->post('/reset-password', function (Request $request, Response $response, array $args) {
        $data = $request->getParsedBody();

        // Create an instance of the Functions class located in src/Services/Functions.php created to hand password reset
        $functions = new Functions();

        // api checks if email exists in the database
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

    //Helps displaying user Profile by targeting id
    $app->get('/siteuser/{userId}', function (Request $request, Response $response, array $args) {
        $userId = $args['userId'];
        
        $userData = Capsule::table('siteuser')
            ->where('Id', $userId)
            ->first();  
        
        if (!$userData) {
            $response = $response->withStatus(404)
                ->withHeader('Content-Type', 'application/json');
            $response->getBody()->write(json_encode(['error' => 'User not found']));
            return $response;
        }
        
        $response = $response->withHeader('Content-Type', 'application/json');
        $response->getBody()->write(json_encode($userData));
        return $response;
    });




    $app->group('/users', function (Group $group) {
        $group->get('', ListUsersAction::class);
        $group->get('/{id}', ViewUserAction::class);
    });
};