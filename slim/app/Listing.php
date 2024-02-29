<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $table = 'listings';

    protected $fillable = [
        'Lister',
        'ListingId',
        'ListingDescription',
        'Images', 
        'ListingType',
        'ListingLocation',
        'ListingDate',
    ];

    public $timestamps = false;
}