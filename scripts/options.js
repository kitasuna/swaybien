// Saves options to chrome.storage
function save_options() {
	//Validation
	if(!validate_form()) {
		return;
	}

	var tabs = document.getElementById('tabs').value;
	var sort = document.getElementById('sort').value;
	var showRecent = document.getElementById('show_recent').checked ? true : false;
	var recentItemCount = document.getElementById('show_recent').checked ? document.getElementById('recent_count').value : 3;
	var recentExclude = document.getElementById('recent_exclude').checked ? true : false;
	chrome.storage.sync.set({
		tabsBehavior: tabs,
		sortBehavior: sort,
		showRecentBehavior: showRecent,
		recentItemCount: recentItemCount,
		recentExclude: recentExclude,
	}, function() {
		// Update status to let user know options were saved.
		var error = document.getElementById('error');
		error.textContent = '';
		var status = document.getElementById('status');
		status.textContent = 'Options saved!';
		setTimeout(function() {
			status.textContent = '';
		}, 1750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
// This is where the default option values are also stored.
function restore_options() {
	chrome.storage.sync.get({
		tabsBehavior: 'new',
		sortBehavior: 'alpha',
		showRecentBehavior: true,
		recentItemCount: 3,
		recentExclude: false,
	}, function(items) {
		document.getElementById('tabs').value = items.tabsBehavior;
		document.getElementById('sort').value = items.sortBehavior;
		document.getElementById('show_recent').checked = items.showRecentBehavior;
		document.getElementById('recent_count').value = items.recentItemCount;
		document.getElementById('recent_exclude').checked = items.recentExclude;

		if(items.showRecentBehavior) {
			document.getElementById('recent_count_div').style.visibility = 'visible';
		}
	});
}

function toggle_recent_count() {
	if(document.getElementById('show_recent').checked) {
		document.getElementById('recent_count_div').style.visibility = 'visible';
	} else {
		document.getElementById('recent_count_div').style.visibility = 'hidden';
	}
}

function validate_form() {
	var showRecent = document.getElementById('show_recent').checked ? true : false;

	if(showRecent) {
		var recentItemCount = document.getElementById('recent_count').value;
		
		//recentItemCount = parseInt(recentItemCount, 10);
		if(recentItemCount%1 != 0 || recentItemCount < 1 || recentItemCount > 10) {
			var error = document.getElementById('error');
			error.textContent = 'Please set your recent count to be a number between 1 and 10.';
			
			return false;
		}
	}

	return true;
}

function load_bookmark_list() {
	chrome.bookmarks.getTree(function(itemTree){
			
			allfolders = new Array();
			itemTree.forEach(function(item){
				processNode(item);				
			});

			
			var tmp_html = "";
			allfolders.forEach(function(item) {
				tmp_html += "<input type='checkbox' id='include_folders["+item.id+"]' name='include_folders["+item.id+"]' value='1' /> <label for='include_folders["+item.id+"]'>" + item.title + "</label><br />";
			});
			document.getElementById('include-folder-list').innerHTML = tmp_html;
		});
}

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

document.addEventListener('DOMContentLoaded', restore_options);
document.addEventListener('DOMContentLoaded', load_bookmark_list);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('show_recent').addEventListener('change', toggle_recent_count);