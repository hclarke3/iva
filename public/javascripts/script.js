var animateNext = function() {
  $('.nextItem img').transition({
    rotateX: '360deg',
    duration: 800
  }, function() {
    $('.nextItem img').css('-webkit-transform', 'rotateX(0deg)');
  });
};

var animateSelect = function(fn) {
  var callback = fn || function() {
    $('.selectItem img').css('-webkit-transform', 'rotateX(0deg)');
  };

  $('.selectItem img').transition({
    rotateX: '360deg',
    duration: 800
  }, callback);
};

var animatePrev = function() {
  $('.prevItem img').transition({
    rotateX: '360deg',
    duration: 800
  }, function() {
    $('.prevItem img').css('-webkit-transform', 'rotateX(0deg)');
  });
};

var nextItem = function(carousel) {
  var totalItems = $('.item').length;
  var currItem = $('#instructionSet .active').index(carousel + ' .item');
  if (currItem < totalItems - 1) {
    animateNext();
    $(carousel).carousel('next');
  }
};

var selectApplication = function() {
  animateSelect(function() {
    var id = $('#applicationSet .active .app-icon').attr('id');
    if (id) {
      window.location.href = id;
    }
  });
}

var prevItem = function(carousel) {
  var currItem = $('#instructionSet .active').index(carousel + ' .item');
  if (currItem !== 0) {
    animatePrev();
    $(carousel).carousel('prev');
  }
};

var toggleComplete = function() {
  var id = $('#instructionSet .active').index('#instructionSet .item')+1;

  var elementid = $('#instructionSet .active .togglebox').attr('id');
  var element = $('#'+elementid);
  var bigcheckid = $('.bigcheck', element).attr('id');
  var bigcheck = $('#'+bigcheckid);

  element.toggleClass('complete');

  var littlechecksrc = $('#littlecheck'+id).attr('src');
  if (littlechecksrc === '/images/'+id+'icon.png') {
    $('#littlecheck'+id).attr('src', '/images/doneicon.png');
  } else {
    $('#littlecheck'+id).attr('src', '/images/'+id+'icon.png');
  }

  animateSelect();
  bigcheck.toggleClass('hide');
};