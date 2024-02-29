<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $table = 'Listings'; 

    protected $fillable = [
        'Lister',
        'ListingId', 
        'ListingDescription',
        'ListingType',
        'ListingDate'
    ];

    public $timestamps = false;
}