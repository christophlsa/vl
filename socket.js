var socketio = require('socket.io');

exports.listen = function (app) {
	var io = socketio.listen(app);

	io.configure(function() {
		io.set('store', backend.socketIoStore);
	});

	io.registerProjector = function () {
		return io.of("/projectors").on("connection", function (socket) {
			socket.on('registerdefaultprojector', function (data) {
				backend.projectors.getDefault(function (projectorid) {
					socket.emit('projector-set-default', {projectorid: projectorid});
				});
			});

			socket.on('registerprojectors', function (data) {
				backend.projectors.getAll(function (projectorid, projector) {
					socket.emit('projector-add', {projectorid: projectorid, projector: projector});
				});
			});

			socket.on('registerprojector', function (data) {
				// Initialize Projectorstate
				backend.projectors.get(data.projectorid, function (projector) {
					if (projector == null) {
						socket.emit('err:projector-not-found:' + data.projectorid, {});
					} else {
						socket.emit('projector-change:' + data.projectorid, {projector : projector});
					}
				});

				backend.projectors.getTimers(data.projectorid, function (timerid, timer) {
					socket.emit('projector-showtimer:' + data.projectorid, { timerid : timerid, timer : timer });
				});
			});
		});
	}

	io.registerTimers = function () {
		return io.of("/timers").on("connection", function (socket) {
			socket.on('registertimers', function (data) {
				backend.timers.getAll(function (timerid, timer) {
					socket.emit('timer-add', {timerid: timerid, timer: timer});
				});
			});
		});
	}

	io.registerAgenda = function () {
		return io.of("/agenda").on("connection", function (socket) {
			socket.on('registeragenda', function (data) {
				// client may ask for children
				var position = 0;
				backend.agenda.eachChildren(null, function(slideid, slide) {
					socket.emit('slide-add', {slideid: slideid, position: position++});
				});
			});

			socket.on('registerslide', function (data) {
				backend.agenda.get(data.slideid, function (slide) {
					if (slide == null) {
						socket.emit('err:slide-not-found:' + data.slideid, {});
					} else {
						socket.emit('slide-change:' + data.slideid, { slide: slide });
					}
				});

				if (data.sendChildren) {
					// Send children
					var position = 0;
					backend.agenda.eachChildren(data.slideid, function(subslideid, subslide) {
						socket.emit('slide-add:' + data.slideid, {slideid: subslideid, position: position++});
					});
				}
			});
		});
	}

	io.registerMotions = function () {
		return io.of("/motions").on("connection", function (socket) {
			socket.on('registermotionclasses', function (data) {
				// client may ask for children
				var position = 0;
				backend.motionclasses.eachChildren(null, function(motionclassid, motionclass) {
					socket.emit('motionclass-add', {motionclassid: motionclassid, position: position++});
				});
			});

			socket.on('registermotionclass', function (data) {
				backend.motionclasses.get(data.motionclassid, function (motionclass) {
					if (motionclass == null) {
						socket.emit('err:motionclass-not-found:' + data.motionclassid, {});
					} else {
						socket.emit('motionclass-change:' + data.motionclassid, { motionclass: motionclass });
					}
				});

				// Send children
				var position = 0;
				backend.motionclasses.eachChildren(data.motionclassid, function (motionclassid, motionclass) {
					socket.emit('motionclass-add:' + data.motionclassid, { motionclassid: motionclassid, position: position++ });
				});

				// Send motions
				var motionPosition = 0;
				backend.motionclasses.eachMotion(data.motionclassid, function (motionid, motion) {
					socket.emit('motion-add:' + data.motionclassid, { motionid: motionid, position: motionPosition++ });
				});
			});

			socket.on('registermotion', function (data) {
				backend.motions.get(data.motionid, function (motion) {
					if (motion == null) {
						socket.emit('err:motion-not-found:' + data.motionid, {});
					} else {
						socket.emit('motion-change:' + data.motionid, { motion : motion });
					}
				});
			});
		});
	}

	io.registerPollsites = function () {
		return io.of("/pollsites").on("connection", function (socket) {
			socket.on('registerpollsites', function (data) {
				backend.pollsites.getAll(function (pollsiteid, pollsite) {
					socket.emit('pollsite-add', {pollsiteid: pollsiteid, pollsite: pollsite});
				});
			});
		});
	}

	io.registerElections = function () {
		return io.of("/elections").on("connection", function (socket) {
			socket.on('registerelections', function (data) {
				backend.elections.getAll(function (electionid, election) {
					socket.emit('election-add', {electionid: electionid});
				});
			});

			socket.on('registerelection', function (data) {
				backend.elections.get(data.electionid, function (election) {
					if (election == null) {
						socket.emit('err:election-not-found:' + data.electionid, {});
					} else {
						socket.emit('election-change:' + data.electionid, { election : election });
					}
				});
			});
		});
	}

	return io;
}
