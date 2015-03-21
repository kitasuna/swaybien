/*
	TODO

	Sort by frequency of use (count last x clicks, for example)
	Option to exclude folders
	Optional root folder
	Pure random vs. biased (recently viewed pages show up less)
*/
var zui = {
	

	printBookmarks: function() {
		
		//chrome.storage.sync.clear();
		allfolders = new Array();

		chrome.bookmarks.getTree(function(itemTree){
			itemTree.forEach(function(item){
				processNode(item);

			});

		chrome.storage.sync.get({
			clickHistory: new Array(),
			excludeFolders: new Array(),
			showRecentBehavior: true,
			recentItemCount: 3,
			recentExclude: false,
			sortBehavior: 'alpha',
		}, function(items) {
			
			/*
			*
			*	If the option to display recent items is enabled,
			*	list them out here.
			*
			*
			*/
			if(items.showRecentBehavior == true) {
				var tmphtml = '';
				
				if(items.clickHistory.length > 0) {
					tmphtml += '<div style="min-height: 60px;">';
					tmphtml += '<h4>Recent</h4>';
				}

				// Somewhere in here we need to check if these folders actually exist with these ids
				// and also if they have the same names...
				for(i=0; i < items.recentItemCount && i < items.clickHistory.length; i++) {
					
					var exists = false;

					allfolders.forEach(function(node) {
						console.log(node.id);
						if(node.id == items.clickHistory[i].id) {
							items.clickHistory[i].text = node.title;
							exists = true;
						}
					});
					
					if(exists) {
						tmphtml += '<li><a href="#" id ="'+items.clickHistory[i].id+'">' + items.clickHistory[i].text + '</a></li>';
					}
					//Remove this element from the main array
					if(items.recentExclude) {
						allfolders = allfolders.filter(function(elem){return elem.id !== items.clickHistory[i].id;});
					}
				}

				if(items.clickHistory.length > 0) {
					tmphtml += '</div><hr />';
				}

				document.getElementById('recent-list').innerHTML += tmphtml;


			}


			/*
			*
			*	Finished displaying Recent items (if applicable)
			*	Now for the rest of the list...
			*
			*/

			if(items.sortBehavior == 'alpha') {
				allfolders.sort(alpha_compare);
			}
			

			allfolders.forEach(function(node) {
				if(items.excludeFolders.indexOf(node.id) == -1) {
					document.body.innerHTML += '<li><a href="#" id ="'+node.id+'">' + node.title + '</a></li>';
				}
			});

			// Now we want to go through each of the folders
			// that we appended to the UL,
			// and add our click event handler
			var links = document.getElementsByTagName("a");
			
			for (var i = 0; i < links.length; i++) {
				(function () {
					var ln = links[i];
					var location = ln.href;
					
					// Here's our event handler.
					// When clicked, it uses the id of the folder
					// to go get all the bookmarked URLs within that folder.
					// It then selects one of those at random and
					// creates a new tab.
					ln.onclick = function () {
						//Store that last click
						
						chrome.storage.sync.get({
								clickHistory: new Array(),
								recentItemCount: 3,
							}, function(items) {

								for (i = 0; i < items.clickHistory.length; i++) {
									if (items.clickHistory[i].id == ln.id) {
										items.clickHistory.splice(i, 1);
									}
								}

								/*
									The "recent" list can only display a max of 10 items,
									so we'll limit ourselves to only storing that many
									items.
								*/
								if(items.clickHistory.length >= 10) {
									items.clickHistory.pop();
								}
								items.clickHistory.unshift({ "id":ln.id, "text": ln.text});

								chrome.storage.sync.set({
									clickHistory: items.clickHistory,
									}, function() {
										return;
									}
								);
							}
						);
						
						chrome.bookmarks.getChildren(ln.id, function(children) {
							document.body.innerHTML = "";
							
							var potential_urls = new Array();
							var max_length = 64;
							children.forEach(function(item){
								if(item.url && potential_urls.length < max_length) {
									potential_urls.push(item.url);
								}
							});

							var rand_min = 0;
							var rand_max = potential_urls.length - 1;
							var rand_int = Math.floor(Math.random() * (rand_max - rand_min + 1)) + rand_min;
							chrome.storage.sync.get({
								tabsBehavior: 'new'
							}, function(items) {
								if(items.tabsBehavior == 'new') {
									chrome.tabs.create({active: true, url: potential_urls[rand_int]}, function(){window.close()});
								} else if(items.tabsBehavior == 'current') {
									chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
										tab = tabs[0];
										chrome.tabs.update(tab.id, {active: true, url: potential_urls[rand_int]}, function(){window.close()});
									});
								}
							}); // end get tabs setting handler
							
						});	// end chrome.bookmarks.getChildren

					};	// end ln.onclick
				})();
			}

			return;
		});

		function processNode(node) {
			if(node.children) {
				
				// If there's children, that means it's a folder, so we push that item
				// onto the array for sorting.
				// Then we look through its children for any subfolders
				if(node.title != "") {
					//document.body.innerHTML += '<li><a href="#" id ="'+node.id+'">' + node.title + '</a></li>';
					allfolders.push(node);
				}
				node.children.forEach(function(child) { processNode(child); });
				
			}
			
			

			//Do nothing because with bookmarks, because only want folders
			if(node.url) {}

		} // end processNode()
		});

		

		
		function alpha_compare(a,b) {
			if(a.title.toLowerCase() < b.title.toLowerCase()) {
				return -1;
			}

			if(a.title.toLowerCase() > b.title.toLowerCase()) {
				return 1;
			}
				
			return 0;
		}
		

	}, // end printBookmarks()

	
}; // end zui definition


document.addEventListener('DOMContentLoaded', function () {

	zui.printBookmarks();

});


