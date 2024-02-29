<?php

namespace App;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ListingController
{
    public function createListing(Request $request, Response $response): Response
    {

        
        // Parse JSON request body
        $data = $request->getParsedBody();

        // Validate and sanitize input data
        $lister = filter_var($data['Lister'], FILTER_SANITIZE_SPECIAL_CHARS);
        $listingDescription = filter_var($data['description'], FILTER_SANITIZE_SPECIAL_CHARS);
        $images = $data['images'];
        $listingLocation = filter_var($data['ListingType'], FILTER_SANITIZE_SPECIAL_CHARS);
        $listingType = filter_var($data['ListingLocation'], FILTER_SANITIZE_SPECIAL_CHARS);
        $listingDate = filter_var($data['ListingDate'], FILTER_SANITIZE_SPECIAL_CHARS);
        // Insert into the database
        $listing = new Listing();
        $listing->lister = $lister;
        $listing->listing_description = $listingDescription;
        $listing->listing_type = $listingType;
        $listing->listing_location = $listingLocation;
        $listing->listing_date = $listingDate;
        $listing->images = $images;

        $connection = $listing->getConnection();
        var_dump($connection);

        $listing->save();

        // Return a response (you might customize this based on your needs)
        $response->getBody()->write(json_encode(['message' => 'Listing created successfully']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}