(function() {
    fabric.Object.prototype.transparentCorners = false;
    var $ = function(id) {
        return document.getElementById(id)
    };

    function applyFilter(index, filter) {
        var obj = canvas.getActiveObject();
        obj.filters[index] = filter;
        obj.applyFilters(canvas.renderAll.bind(canvas));
    }

    function applyFilterValue(index, prop, value) {
        var obj = canvas.getActiveObject();
        if (obj.filters[index]) {
            obj.filters[index][prop] = value;
            obj.applyFilters(canvas.renderAll.bind(canvas));
        }
    }

    fabric.Object.prototype.padding = 5;
    fabric.Object.prototype.transparentCorners = false;

    var canvas = this.__canvas = new fabric.Canvas('c'),
        f = fabric.Image.filters;

    fabric.Image.fromURL('assets/bg.png', function(img) {
        canvas.backgroundImage = img;
        canvas.backgroundImage.width = 600;
        canvas.backgroundImage.height = 600;
    });


    canvas.on({
        'object:selected': function() {
            fabric.util.toArray(document.getElementsByTagName('input'))
                .forEach(function(el) {
                    el.disabled = false;
                })

            var filters = ['grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
                'brightness', 'noise', 'gradient-transparency', 'pixelate',
                'blur', 'sharpen', 'emboss', 'tint'
            ];

            for (var i = 0; i < filters.length; i++) {
                $(filters[i]).checked = !!canvas.getActiveObject().filters[i];
            }
        },
        'selection:cleared': function() {
            fabric.util.toArray(document.getElementsByTagName('input'))
                .forEach(function(el) {
                    el.disabled = true;
                })
        }
    });

    fabric.Image.fromURL('assets/robot.png', imageLoaderCallBack);

    function imageLoaderCallBack(img) {
        var oImg = img.set({
                left: 50,
                top: 100,
                angle: -5
            }).scaleToWidth(canvas.width)
            .scaleToHeight(canvas.height);;
        canvas.add(oImg).renderAll();
        canvas.setActiveObject(oImg);
    }

    $('grayscale').onclick = function() {
        applyFilter(0, this.checked && new f.Grayscale());
    };
    $('invert').onclick = function() {
        applyFilter(1, this.checked && new f.Invert());
    };
    $('remove-white').onclick = function() {
        applyFilter(2, this.checked && new f.RemoveWhite({
            threshold: $('remove-white-threshold').value,
            distance: $('remove-white-distance').value
        }));
    };
    $('remove-white-threshold').onchange = function() {
        applyFilterValue(2, 'threshold', this.value);
    };
    $('remove-white-distance').onchange = function() {
        applyFilterValue(2, 'distance', this.value);
    };
    $('sepia').onclick = function() {
        applyFilter(3, this.checked && new f.Sepia());
    };
    $('sepia2').onclick = function() {
        applyFilter(4, this.checked && new f.Sepia2());
    };
    $('brightness').onclick = function() {
        applyFilter(5, this.checked && new f.Brightness({
            brightness: parseInt($('brightness-value').value, 10)
        }));
    };
    $('brightness-value').onchange = function() {
        applyFilterValue(5, 'brightness', parseInt(this.value, 10));
    };
    $('noise').onclick = function() {
        applyFilter(6, this.checked && new f.Noise({
            noise: parseInt($('noise-value').value, 10)
        }));
    };
    $('noise-value').onchange = function() {
        applyFilterValue(6, 'noise', parseInt(this.value, 10));
    };
    $('gradient-transparency').onclick = function() {
        applyFilter(7, this.checked && new f.GradientTransparency({
            threshold: parseInt($('gradient-transparency-value').value, 10)
        }));
    };
    $('gradient-transparency-value').onchange = function() {
        applyFilterValue(7, 'threshold', parseInt(this.value, 10));
    };
    $('pixelate').onclick = function() {
        applyFilter(8, this.checked && new f.Pixelate({
            blocksize: parseInt($('pixelate-value').value, 10)
        }));
    };
    $('pixelate-value').onchange = function() {
        applyFilterValue(8, 'blocksize', parseInt(this.value, 10));
    };
    $('blur').onclick = function() {
        applyFilter(9, this.checked && new f.Convolute({
            matrix: [1 / 9, 1 / 9, 1 / 9,
                1 / 9, 1 / 9, 1 / 9,
                1 / 9, 1 / 9, 1 / 9
            ]
        }));
    };
    $('sharpen').onclick = function() {
        applyFilter(10, this.checked && new f.Convolute({
            matrix: [0, -1, 0, -1, 5, -1,
                0, -1, 0
            ]
        }));
    };
    $('emboss').onclick = function() {
        applyFilter(11, this.checked && new f.Convolute({
            matrix: [1, 1, 1,
                1, 0.7, -1, -1, -1, -1
            ]
        }));
    };
    $('tint').onclick = function() {
        applyFilter(12, this.checked && new f.Tint({
            color: $('tint-color').value,
            opacity: parseFloat($('tint-opacity').value)
        }));
        var svg = canvas.toSVG();
    };
    $('tint-color').onchange = function() {
        applyFilterValue(12, 'color', this.value);
    };
    $('tint-opacity').onchange = function() {
        applyFilterValue(12, 'opacity', parseFloat(this.value));
    };

    //IMAGE LOADING
    var progress = document.querySelector('.percent');

    function abortRead() {
        reader.abort();
    }

    function errorHandler(evt) {
        switch (evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                alert('File Not Found!');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert('File is not readable');
                break;
            case evt.target.error.ABORT_ERR:
                break; // noop
            default:
                alert('An error occurred reading this file.');
        };
    }

    function updateProgress(evt) {
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                progress.style.width = percentLoaded + '%';
                progress.textContent = percentLoaded + '%';
            }
        }
    }

    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // Reset progress indicator on new file selection.
        progress.style.width = '0%';
        progress.textContent = '0%';

        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, f; f = files[i]; i++) {

            // Only process image files.
            if (!f.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();
            reader.onerror = errorHandler;
            reader.onprogress = updateProgress;
            reader.onabort = function(e) {
                alert('File read cancelled');
            };
            reader.onloadstart = function(e) {
                $('progress_bar').className = 'loading';
            };

            // Closure to capture the file information.
            reader.onload = (function(theFile) {

                // Ensure that the progress bar displays 100% at the end.
                progress.style.width = '100%';
                progress.textContent = '100%';
                setTimeout("document.getElementById('progress_bar').className='';", 2000);

                return function(e) {
                    // Render thumbnail.
                    var file = e.target.result; // the actually file
                    var fileName = escape(theFile.name); //don't need
                    //get file and load it to canvas...
                    canvas.getActiveObject().remove()
                    fabric.Image.fromURL(file, imageLoaderCallBack);
                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsDataURL(f);
        }
    }

    //SAVING IMAGE
    $('files3').addEventListener('change', handleFileSelect, false);

    var imageCanvas = $('c');
    var ctp = new CanvasToPNG('php/CanvasToPNG.php')
    ctp.setSaveButton('#saveToPNG', imageCanvas, 'myimage');

})();