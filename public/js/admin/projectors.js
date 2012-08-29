// vim:noet:ts=4:sw=4:

$(function() {
	var dialogModel = {
		id: ko.observable(null),
		name: ko.observable(''),
		color: ko.observable(''),

		save: function() {
			var data = {
				name: this.name(),
				color: this.color()
			};

			model.projectors.save(this.id(), data);
			dialog.modal('hide');
		},
		remove: function() {
			model.projectors.remove(this.id());
			dialog.modal('hide');
		},
	};

	var dialog = $("#projector-options");
	ko.applyBindings(dialogModel, dialog.get(0));

	// slightly hacky, depends on internal implementation of jquery-miniColors
	dialog.find('[name="color"]').data('change', dialogModel.color);

	$('#new-projector').click(function() {
		dialogModel.id(null);
		dialogModel.name('');
		dialogModel.color('');
		dialog.modal('show');
	});

	$('#projectors table tbody').on('click', '.click-to-edit', function() {
		var self = ko.dataFor(this);
		dialogModel.id(self.id);
		dialogModel.name(self.name());
		dialogModel.color(self.color());
		dialog.modal('show');
	});

	ko.applyBindings(model.projectors.list, $('#projectors table tbody').get(0));
});
