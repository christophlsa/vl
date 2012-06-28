// vim:noet:sw=8:

function TreeTable(node, options) {
	this.node = node;
	// prepend "a" to avoid prefixes starting with numbers (which will fail due to css-classes)
	this.prefix = "a" + generateID() + "-";
	this.moveCallback = null;
	this.styles = {};
	this.moveWidth = 70;
	this.listMargin = 15;

	var self = this;

	if (! options) {
		options = {};
	}
	options.handle = '.' + this.prefix + 'move';
	options.toleranceElement = "> div";
	options.items = "li";
	options.update = function (ev, ui) {
		var id = ui.item.children("." + self.prefix + "id").text();
		var type = ui.item.children("." + self.prefix + "type").text();
		var parentid = null;
		var parenttype = null;
		if (! ui.item.parent().hasClass("ui-sortable")) {
			parentid = ui.item.parent().parent().children("." + self.prefix + "id").text();
			parenttype = ui.item.parent().parent().children("." + self.prefix + "type").text();
		}
		var position = ui.item.parent().children("." + self.prefix + type).index(ui.item);

		if (self.moveCallback) {
			return self.moveCallback(id, parentid, position, type, parenttype);
		} else {
			return false;
		}
	};

	$(this.node).nestedSortable(options);
}

TreeTable.prototype.onMove = function (callback) {
	this.moveCallback = callback;
}

TreeTable.prototype.setStyle = function (type, field, style) {
	if (!this.styles[type]) {
		this.styles[type] = {};
	}
	this.styles[type][field] = style;
}

TreeTable.prototype.add = function (type, id, parenttype, parentid, position, data) {
	var contentItem = $("<div>").addClass(this.prefix + type);
	for (var key in data) {
		var fieldItem = data[key].addClass(this.prefix + type).addClass(this.prefix + key).css("float", "left");
		if (this.styles[type] && this.styles[type][key]) {
			fieldItem.css(this.styles[type][key]);
		}
		contentItem.append(fieldItem);
	}
	contentItem.append($("<div>").css("clear", "left"));

	var parentList = null;
	if (parentid == null) {
		parentList = $(this.node);
	} else {
		var parent = this.get(parenttype, parentid).parent();
		if (parent.children("ol").length == 0) {
			parent.append($("<ol>"));
		}
		parentList = parent.children("ol");
	}

	var moveWidth = this.moveWidth;
	var current = parentList;
	while (! current.hasClass("ui-sortable") && moveWidth > 0) {
		moveWidth -= this.listMargin;
		current = current.parent().parent();
	}

	var item = $("<li>").attr("id", this.prefix + type + "-" + id).addClass(this.prefix + type)
		.append($("<span>").addClass(this.prefix + "type").text(type).hide())
		.append($("<span>").addClass(this.prefix + "id").text(id).hide())
		.append($("<span>").addClass(this.prefix + "move").css("float","left").css("width", moveWidth + "px")
			.append($("<i>").addClass("icon-move")))
		.append(contentItem);

	if (!position || position == 0) {
		if (parentList.children("li." + (this.prefix + type)).length > 0) {
			parentList.children("li." + (this.prefix + type) + ":eq(0)").before(item);
		} else {
			parentList.prepend(item);
		}
	} else {
		parentList.children("li." + (this.prefix + type) + ":eq(" + (position-1) + ")").after(item);
	}
}

TreeTable.prototype.get = function (type, id, element) {
	var item = $(this.node + " #" + (this.prefix + type + "-" + id)).children("." + this.prefix + type);
	if (element) {
		item = item.children("." + this.prefix + element);
	}
	return item;
}

TreeTable.prototype.remove = function (type, id) {
	this.get(type, id).parent().remove();
}
