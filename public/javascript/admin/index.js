function generateID() {
	return Math.random().toString(36).substring(2);
}

$(function () {
	$(".modal").on("hide", function() {
		$(this).find(".miniColors").miniColors("destroy");
	});
});
