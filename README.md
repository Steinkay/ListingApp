
Reactapp v--"0.1.0"
Slim 4

Firstly, In slim folder, go to the app folder, find a file called dependencies.php update this code to match your database connection credentials:

 $capsule->addConnection([
                'driver' => 'mysql',
                'host' => 'localhost',
                'database' => 'listingapp',
                'username' => 'root',
                'password' => '', 
                'charset' => 'utf8',
                'collation' => 'utf8_unicode_ci',
                'prefix' => '',
            ]);


To start Slim app, run php -S localhost:8080 -t public when in Slim' folder in your terminal

To start React app, run npm start when ;reactapp' folder in the terminal

