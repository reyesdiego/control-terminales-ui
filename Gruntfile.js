module.exports = function(grunt) {

	grunt.initConfig({
		concat: {
			css: {
				src: [
					'css/app.css',
					'css/angular-multi-select.css',
					'css/animation.css',
					'css/dialogs.css',
					'css/notificaciones.css',
					'css/animate.css',
					'css/ionicons.css',
					'js/angular-notify/angular-notify.css',
					'css/pivot.css',
					'bower_components/ng-tags-input/ng-tags-input.css'
				],
				dest: 'build/css/aditional.css'
			},
			js : {
				src : [
					'main/main.js',
					'main/configProd.js',
					'class/*',
					'controller/**/*',
					'directives/*',
					'factory/*',
					'filter/*',
					'service/**/*.js'
				],
				dest : 'build/js/app.js'
			},
			pivottable: {
				src: [
					'js/pivottable/pivot.js',
					'js/pivottable/pivot.es.js',
					'js/pivottable/gchart_renderers.js'
				],
				dest: 'build/js/pivottable.js'
			}
		},
		cssmin: {
			css: {
				src: 'build/css/aditional.css',
				dest: 'build/css/aditional.min.css'
			},
			bactssa: {
				src: 'css/bootstrap.cerulean.css',
				dest: 'build/css/bootstrap.cerulean.css'
			},
			terminal4: {
				src: 'css/bootstrap.united.css',
				dest: 'build/css/bootstrap.united.css'
			},
			trp: {
				src: 'css/bootstrap.flaty.css',
				dest: 'build/css/bootstrap.flaty.css'
			}
		},
		babel: {
			options: {
				sourceMap: true,
				presets: ['es2015']
			},
			dist: {
				files: {
					'build/js/app.js': 'build/js/app.js',
					'build/js/pivottable.js': 'build/js/pivottable.js'
				}
			}
		},
		uglify: {
			js: {
				files: {
					'build/js/app.min.js' : ['build/js/app.js'],
					'js/angular-notify/angular-notify.min.js' : ['js/angular-notify/angular-notify.js'],
					'build/js/pivottable.min.js': ['build/js/pivottable.js']
				}
			}
		},
		processhtml: {
			dist: {
				files: {
					'build/index.html' : 'index.html'
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						src: ['bower_components/jquery/dist/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/jquery-ui/*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-animate/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular/angular-csp.css'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-cache/dist/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-cookies/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-i18n/angular-locale_es-ar.js'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-sanitize/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-bootstrap/*-tpls.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-bootstrap/ui-bootstrap-csp.css'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-bootstrap/uib/template/*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-ui-router/release/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/bootstrap-ui-datetime-picker/dist/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/angular-socket-io/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['bower_components/ng-tags-input/*.min.*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['fonts/*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['images/*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['js/angular-notify/*.js', 'js/angular-locale_es-ar.js', 'js/html5.js', 'js/linq.min.js', 'js/moment-with-locales.min.js', 'js/socket.io.min.js'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['view/**/*'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['service/dialogs/*.html'],
						dest: 'build'
					},
					{
						expand: true,
						src: ['conversorPDF/**'],
						dest: 'build'
					}
				]
			}
		},
		mkdir: {
			temp: {
				options: {
					mode: 777,
					create: ['build/conversorPDF/.temp']
				}
			}
		},
		chmod: {
			options: {
				mode: 'a+w'
			},
			tempFolder: {
				src: ['build/conversorPDF/.temp']
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-mkdir');
	grunt.loadNpmTasks('grunt-chmod');
	grunt.loadNpmTasks('grunt-babel');

	// Default task(s).
	grunt.registerTask('default', [
		'concat:css',
		'concat:js',
		'concat:pivottable',
		'cssmin:css',
		'cssmin:bactssa',
		'cssmin:terminal4',
		'cssmin:trp',
		'babel',
		'uglify:js',
		'processhtml:dist',
		'copy:main',
		'mkdir:temp',
		'chmod:tempFolder'
	]);
};
