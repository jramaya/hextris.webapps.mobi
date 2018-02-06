// Set a name for the current cache
var cacheName = 'v1'; 

// Default files to always cache
var cacheFiles = [
	'./',
	'./index.html?launcher=true',
	'./launcher-icon-1x.png',
	'./launcher-icon-2x.png',
	'./launcher-icon-4x.png',
	'./launcher-icon-apple.png',
	'./include/css/fa/css/font-awesome.css',
	'./include/css/fa/css/font-awesome.min.css',
	'./include/css/fa/fonts/fontawesome-webfont.eot',
	'./include/css/fa/fonts/fontawesome-webfont.svg',
	'./include/css/fa/fonts/fontawesome-webfont.ttf',
	'./include/css/fa/fonts/fontawesome-webfont.woff',
	'./include/css/fa/fonts/FontAwesome.otf',
	'./include/css/fonts/Lovelo.otf',
	'./include/css/fonts/QuattrocentoSans-Regular.ttf',
	'./include/css/fonts/roboto.woff',
	'./include/css/site.css',
	'./include/css/style.css',
	'./include/css/fa/css/font-awesome.min.css',
	'./include/js/library/hammer.min.js',
	'./include/js/library/jsonfn.min.js',
	'./include/js/library/keypress.min.js',
	'./include/js/library/jquery.js',
	'./include/js/initialization.js',
	'./include/js/appli-v9/save-state.js',
	'./include/js/appli-v9/view.js',
	'./include/js/appli-v9/wavegen.js',
	'./include/js/appli-v9/math.js',
	'./include/js/appli-v9/Block.js',
	'./include/js/appli-v9/Hex.js',
	'./include/js/appli-v9/Text.js',
	'./include/js/appli-v9/comboTimer.js',
	'./include/js/appli-v9/checking.js',
	'./include/js/appli-v9/update.js',
	'./include/js/appli-v9/render.js',
	'./include/js/appli-v9/input.js',
	'./include/js/appli-v9/main.js',
	'https://fonts.googleapis.com/css?family=Exo+2'
	
]


self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');

    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(

    	// Open the cache
	    caches.open(cacheName).then(function(cache) {

	    	// Add all the default files to the cache
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
	    })
	); // end e.waitUntil
});


self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activated');

    e.waitUntil(

    	// Get all the cache keys (cacheName)
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {

				// If a cached item is saved under a previous cacheName
				if (thisCacheName !== cacheName) {

					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); // end e.waitUntil

});


self.addEventListener('fetch', function(e) {
	console.log('[ServiceWorker] Fetch', e.request.url);

	// e.respondWidth Responds to the fetch event
	e.respondWith(

		// Check in cache for the request being made
		caches.match(e.request)


			.then(function(response) {

				// If the request is in the cache
				if ( response ) {
					console.log("[ServiceWorker] Found in Cache", e.request.url, response);
					// Return the cached version
					return response;
				}

				// If the request is NOT in the cache, fetch and cache

				var requestClone = e.request.clone();
				fetch(requestClone)
					.then(function(response) {

						if ( !response ) {
							console.log("[ServiceWorker] No response from fetch ")
							return response;
						}

						var responseClone = response.clone();

						//  Open the cache
						caches.open(cacheName).then(function(cache) {

							// Put the fetched response in the cache
							cache.put(e.request, responseClone);
							console.log('[ServiceWorker] New Data Cached', e.request.url);

							// Return the response
							return response;
			
				        }); // end caches.open

					})
					.catch(function(err) {
						console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
					});


			}) // end caches.match(e.request)
	); // end e.respondWith
});