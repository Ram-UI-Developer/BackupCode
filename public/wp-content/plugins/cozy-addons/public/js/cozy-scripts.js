;(function ($) {
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-slide-widget.default',
            function ($scope, $) {
                var swiperSlide1 = new Swiper('.cozySlider1', {
                    spaceBetween: 0,
                    slidesPerView: 1,
                    centeredSlides: true,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })
                $scope.find('.cozy-addons-slider').each(function () {
                    const cozySlideCarouselTwo = $(this).find('#cozySlideTwo')
                    var ctSlidersPerView = cozySlideCarouselTwo.attr('data-slidePerView')
                    var carouselGridGap = parseInt(
                        cozySlideCarouselTwo.attr('data-carouselColumnGap')
                    )
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (ctSlidersPerView < 3) {
                        var respItemSlide = ctSlidersPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (ctSlidersPerView < 2) {
                        var mobileItemSlide = ctSlidersPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperSlide2 = new Swiper(cozySlideCarouselTwo[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        loop: true,
                        autoplay: {
                            delay: 3000,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: ctSlidersPerView
                            }
                        }
                    })
                })

                var swiperSlide3 = new Swiper('.cozySlider3', {
                    slidesPerView: 1,
                    effect: 'fade',
                    direction: 'vertical',
                    loop: true,
                    autoplay: {
                        delay: 3500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-brand-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-brands-logo').each(function () {
                    const brandsSlideCarousel = $(this).find('#cozyBrandsCarousel')
                    var brandsSlidersPerView = brandsSlideCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(
                        brandsSlideCarousel.attr('data-carouselColumnGap')
                    )
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (brandsSlidersPerView < 3) {
                        var respItemSlide = brandsSlidersPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (brandsSlidersPerView < 2) {
                        var mobileItemSlide = brandsSlidersPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperLogoCarousel = new Swiper(brandsSlideCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: brandsSlidersPerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-team-block.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-teams').each(function () {
                    const teamSlideCarousel = $(this).find('#cozyTeamCarousel')
                    var teamSlidePerView = teamSlideCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(teamSlideCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (teamSlidePerView < 3) {
                        var respItemSlide = teamSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (teamSlidePerView < 2) {
                        var mobileItemSlide = teamSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperLogoCarousel = new Swiper(teamSlideCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: teamSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-post-slider.default',
            function ($scope, $) {
                var postSlider1 = new Swiper('.post-slider-1', {
                    spaceBetween: 0,
                    slidesPerView: 1,
                    centeredSlides: true,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })

                var postSlider2 = new Swiper('.post-slider-3', {
                    spaceBetween: 3,
                    slidesPerView: 1,
                    centeredSlides: true,
                    roundLengths: true,
                    loop: true,
                    loopAdditionalSlides: 30,
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        480: {
                            slidesPerView: 1
                        },
                        768: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 2
                        },
                        1180: {
                            slidesPerView: 2
                        }
                    }
                })

                $scope.find('.cozy-addons-post-slider').each(function () {
                    const postSlidersCarousel = $(this).find('#cozyPostSliders')
                    var postBlogSlidersPerView = postSlidersCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(
                        postSlidersCarousel.attr('data-carouselColumnGap')
                    )
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (postBlogSlidersPerView < 3) {
                        var respItemSlide = postBlogSlidersPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (postBlogSlidersPerView < 2) {
                        var mobileItemSlide = postBlogSlidersPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var postslider23 = new Swiper(postSlidersCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            480: {
                                slidesPerView: 1
                            },
                            768: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: postBlogSlidersPerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-advanced-magblock.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-advanced-magazine-block').each(function () {
                    const advMagCarousel = $(this).find('#advancedMagCarousel')
                    var advancedMagPerView = advMagCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(advMagCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (advancedMagPerView < 3) {
                        var respItemSlide = advancedMagPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (advancedMagPerView < 2) {
                        var mobileItemSlide = advancedMagPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var advancedCarousel3 = new Swiper(advMagCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            480: {
                                slidesPerView: 1
                            },
                            768: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: advancedMagPerView
                            }
                        }
                    })
                })

                var advancedCarousel4 = new Swiper('.advanced-magcarousel-4', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        480: {
                            slidesPerView: 1
                        },
                        768: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 4
                        }
                    }
                })
                var advancedCarousel5 = new Swiper('.advanced-magcarousel-5', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        480: {
                            slidesPerView: 1
                        },
                        768: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 5
                        }
                    }
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-flip-box.default',
            function ($scope, $) {
                $('.flip-box-holder').hover(
                    function () {
                        $(this).addClass('flip')
                    },
                    function () {
                        $(this).removeClass('flip')
                    }
                )
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-typeout-text.default',
            function ($scope, $) {
                // cozyTypeWriter();
                testTypewriter()
            }
        )
    })

    function testTypewriter() {
        const typeoutText = $('.cozy-typeout-text')
            .toArray()
            .map((element) => {
                console.log(element)
                var firstString = $(element).data('firsttext')
                var firstCharLength = firstString.length
                var secondString = $(element).data('secondtext')
                var secondCharLength = secondString.length
                var thirdString = $(element).data('thirdtext')
                var thirdCharLength = thirdString.length

                var app = element

                var typewriter = new Typewriter(app, {
                    loop: true,
                    delay: 75
                })

                typewriter
                    .pauseFor(500)
                    .typeString(firstString)
                    .pauseFor(300)
                    .deleteChars(firstCharLength)
                    .typeString(secondString)
                    .pauseFor(300)
                    .deleteChars(secondCharLength)
                    .typeString(thirdString)
                    .pauseFor(1000)
                    .start()
            })
    }

    function cozyTypeWriter() {
        var typeWriterElement = document.getElementById('typewriter')

        // var textArray = ["Helo World, We are ","Cozy.","Beautuful", "Funny!"];
        var textArray = $('#typewriter').data('array')
        // function to generate the backspace effect
        function delWriter(text, i, cb) {
            if (i >= 0) {
                typeWriterElement.innerHTML = text.substring(0, i--)
                // generate a random Number to emulate backspace hitting.
                var rndBack = 10 + Math.random() * 100
                setTimeout(function () {
                    delWriter(text, i, cb)
                }, rndBack)
            } else if (typeof cb == 'function') {
                setTimeout(cb, 1000)
            }
        }

        // function to generate the keyhitting effect
        function typeWriter(text, i, cb) {
            if (i < text.length + 1) {
                typeWriterElement.innerHTML = text.substring(0, i++)
                // generate a random Number to emulate Typing on the Keyboard.
                var rndTyping = 250 - Math.random() * 100
                setTimeout(function () {
                    typeWriter(text, i++, cb)
                }, rndTyping)
            } else if (i === text.length + 1) {
                setTimeout(function () {
                    delWriter(text, i, cb)
                }, 500)
            }
        }

        // the main writer function
        function StartWriter(i) {
            if (typeof textArray[i] == 'undefined') {
                setTimeout(function () {
                    StartWriter(0)
                }, 500)
            } else if (i < textArray[i].length + 1) {
                typeWriter(textArray[i], 0, function () {
                    StartWriter(i + 1)
                })
            }
        }
        // wait one second then start the typewriter
        setTimeout(function () {
            StartWriter(0)
        }, 500)
    }

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-faq-list.default',
            function ($scope, $) {
                $('.cozy-accordion .faq-title').click(function () {
                    $(this).addClass('active')
                    $(this).parent().siblings().find('.faq-title').removeClass('active')
                    $(this).parent().find('.faq-content').slideDown()
                    $(this).parent().siblings().find('.faq-content').slideUp()
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-testimonial-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-testimonial').each(function () {
                    const testimonialCarousel = $(this).find('#cozyTestimonialCarousel')
                    var testimonialSlidePerView = testimonialCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(
                        testimonialCarousel.attr('data-carouselColumnGap')
                    )
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (testimonialSlidePerView < 3) {
                        var respItemSlide = testimonialSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (testimonialSlidePerView < 2) {
                        var mobileItemSlide = testimonialSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperTestimonialCarousel = new Swiper(testimonialCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: testimonialSlidePerView
                            }
                        }
                    })
                })
                var swiperTestimonialCarouselSlide = new Swiper('.cozy-testimonial-slide', {
                    spaceBetween: 40,
                    slidesPerView: 1,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })
                var swiperTestimonialCentered = new Swiper('.cozy-testimonial-centered', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    centeredSlides: true,
                    centeredSlidesBounds: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        480: {
                            slidesPerView: 1
                        },
                        768: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 3
                        }
                    }
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-woo-categories.default',
            function ($scope, $) {
                $scope.find('.elementor-widget-container').each(function () {
                    const wooCatCarousel = $(this).find('#wooCatSwiper')
                    var catSlidePerView = wooCatCarousel.attr('data-slidesPerView')
                    var carouselGridGap = parseInt(wooCatCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (catSlidePerView < 3) {
                        var respItemSlide = catSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (catSlidePerView < 2) {
                        var mobileItemSlide = catSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperWooCatCarousel = new Swiper(wooCatCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: catSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-service-list.default',
            function ($scope, $) {
                var swiperServiceCarousel = new Swiper('.cozy-service-default', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 3
                        }
                    }
                })
                var swiperServiceFour = new Swiper('.cozy-service-four', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 4
                        }
                    }
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-promotion-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-promotions').each(function () {
                    const offerCarousel = $(this).find('#cozyOfferCarousel')
                    var offerSlidersPerView = offerCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(offerCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (offerSlidersPerView < 3) {
                        var respItemSlide = offerSlidersPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (offerSlidersPerView < 2) {
                        var mobileItemSlide = offerSlidersPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperPromotionCarousel = new Swiper(offerCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: offerSlidersPerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-blog-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-blog').each(function () {
                    const blogPostCarousel = $(this).find('#cozyPostsCarousel')
                    var postsSlidePerView = blogPostCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(blogPostCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (postsSlidePerView < 3) {
                        var respItemSlide = postsSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (postsSlidePerView < 2) {
                        var mobileItemSlide = postsSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperBlogCarousel = new Swiper(blogPostCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: postsSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-focus-posts.default',
            function ($scope, $) {
                var focusTicker1 = $('.focusNewsTicker')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 1,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.focusup',
                            down: '.focusdown'
                        }
                    })
                    .data('easyTicker')

                var swiperFocus3 = new Swiper('.focuspost-carousel-3', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 3
                        }
                    }
                })
                var swiperFocus4 = new Swiper('.focuspost-carousel-4', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 4
                        }
                    }
                })
                var swiperFocus5 = new Swiper('.focuspost-carousel-5', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 5
                        }
                    }
                })

                var swiperThumb3 = new Swiper('.focuspost-thumb-3', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 3
                        }
                    }
                })

                var swiperThumb4 = new Swiper('.focuspost-thumb-4', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 4
                        }
                    }
                })
                var swiperThumb5 = new Swiper('.focuspost-thumb-5', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 5
                        }
                    }
                })

                var focusVertical3 = $('.focusNewsVertical3')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 3,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.newsfocusup',
                            down: '.newsfocusdown'
                        }
                    })
                    .data('easyTicker')
                var focusVertical4 = $('.focusNewsVertical4')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 4,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.newsfocusup',
                            down: '.newsfocusdown'
                        }
                    })
                    .data('easyTicker')
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-popular-post.default',
            function ($scope, $) {
                var swiperPopularCarousel = new Swiper('.cozy-popularpost-default', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 3
                        }
                    }
                })
                var swiperPopularFour = new Swiper('.cozy-popularpost-four', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 3
                        },
                        1180: {
                            slidesPerView: 4
                        }
                    }
                })
                var swiperPopularTwo = new Swiper('.cozy-popularpost-double', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 2500,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    },
                    breakpoints: {
                        400: {
                            slidesPerView: 1
                        },
                        767: {
                            slidesPerView: 2
                        },
                        1024: {
                            slidesPerView: 2
                        },
                        1180: {
                            slidesPerView: 2
                        }
                    }
                })

                var popularTicker = $('.popularTickerThree')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 3,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.up',
                            down: '.down',
                            toggle: '.toggle',
                            stopText: 'Stop !!!'
                        }
                    })
                    .data('easyTicker')
                var popularTicker1 = $('.popularTickerOne')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 1,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.up',
                            down: '.down',
                            toggle: '.toggle',
                            stopText: 'Stop !!!'
                        }
                    })
                    .data('easyTicker')
                var popularTicker2 = $('.popularTickerTwo')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        height: 'auto',
                        easing: 'swing',
                        visible: 2,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.up',
                            down: '.down',
                            toggle: '.toggle',
                            stopText: 'Stop !!!'
                        }
                    })
                    .data('easyTicker')
                var popularTicker4 = $('.popularTickerFour')
                    .easyTicker({
                        direction: 'up',
                        speed: 'fast',
                        interval: 2000,
                        easing: 'swing',
                        height: 'auto',
                        visible: 4,
                        mousePause: true,
                        autoplay: true,
                        controls: {
                            up: '.up',
                            down: '.down',
                            toggle: '.toggle',
                            stopText: 'Stop !!!'
                        }
                    })
                    .data('easyTicker')
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-product-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-products').each(function () {
                    const productCarousel = $(this).find('#cozyProductsCarousel')
                    var productSlidersPerView = productCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(productCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (productSlidersPerView < 3) {
                        var respItemSlide = productSlidersPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (productSlidersPerView < 2) {
                        var mobileItemSlide = productSlidersPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperProductsCarousel = new Swiper(productCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: productSlidersPerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-woo-slide.default',
            function ($scope, $) {
                var swiperProductSlide = new Swiper('.cozy-product-slide-default', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    speed: 670,
                    parallax: true,
                    effect: 'fade',
                    roundLengths: true,
                    loop: true,
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false
                    },
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        dynamicBullets: false,
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })
                var swiperProductSlide = new Swiper('.cozy-product-slide-style-3', {
                    spaceBetween: 30,
                    slidesPerView: 1,
                    speed: 670,
                    parallax: true,
                    effect: 'fade',
                    roundLengths: true,
                    loop: true,
                    pagination: {
                        el: '.cozy-swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.cozy-slide-next',
                        prevEl: '.cozy-slide-prev',
                        clickable: true
                    }
                })
                $scope.find('.cozy-addons-products-slider').each(function () {
                    const productSliderCarousel = $(this).find('#cozyProductSlideCarousel')
                    var productSlideSliderPerView = productSliderCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(
                        productSliderCarousel.attr('data-carouselColumnGap')
                    )
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (productSlideSliderPerView < 3) {
                        var respItemSlide = productSlideSliderPerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (productSlideSliderPerView < 2) {
                        var mobileItemSlide = productSlideSliderPerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperProductsSlide2 = new Swiper(productSliderCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: productSlideSliderPerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-portfolio-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-portfolios').each(function () {
                    const portfolioCarousel = $(this).find('#cozyPortfolioCarousel')
                    var portfolioSlidePerView = portfolioCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(portfolioCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (portfolioSlidePerView < 3) {
                        var respItemSlide = portfolioSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (portfolioSlidePerView < 2) {
                        var mobileItemSlide = portfolioSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var swiperPortfolioCarousel = new Swiper(portfolioCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: portfolioSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-properties-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-properties-list').each(function () {
                    const propertyCarouel = $(this).find('#cozyPropertyCarousel')
                    var propertySlidePerView = propertyCarouel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(propertyCarouel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (propertySlidePerView < 3) {
                        var respItemSlide = propertySlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (propertySlidePerView < 2) {
                        var mobileItemSlide = propertySlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var propertyCarousel = new Swiper(propertyCarouel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            480: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: propertySlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-travel-destination-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-travel-destination-list').each(function () {
                    const travelCarouel = $(this).find('#cozyTravelCarousel')
                    var packageSlidePerView = travelCarouel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(travelCarouel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (packageSlidePerView < 3) {
                        var respItemSlide = packageSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (packageSlidePerView < 2) {
                        var mobileItemSlide = packageSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var travelListCarousel = new Swiper(travelCarouel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: packageSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-course-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-course-list').each(function () {
                    const courseCarouel = $(this).find('#cozyCourseCarousel')
                    var courseSlidePerView = courseCarouel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(courseCarouel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    // alert(carouselGridGap);
                    if (courseSlidePerView < 3) {
                        var respItemSlide = courseSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (courseSlidePerView < 2) {
                        var mobileItemSlide = courseSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var courseListCarousel = new Swiper(courseCarouel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            400: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: courseSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-nav-menu.default',
            function ($scope, $) {
                var selectedSubMenuIcon = $('.cozy-addons-nav-menu').attr('data-dropDownIcon')
                if (selectedSubMenuIcon == 'angle') {
                    var subMenuIcon =
                        '<button class="dropdown-icon"><svg class="dropdown-menu-icon" width="24" height="15" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.386 14.4881L0.511859 4.61399C-0.17062 3.93151 -0.17062 2.82793 0.511859 2.15271L2.15271 0.511859C2.83519 -0.17062 3.93877 -0.17062 4.61399 0.511859L11.613 7.51089L18.6121 0.511859C19.2945 -0.17062 20.3981 -0.17062 21.0733 0.511859L22.7142 2.15271C23.3967 2.83519 23.3967 3.93877 22.7142 4.61399L12.84 14.4881C12.1721 15.1706 11.0685 15.1706 10.386 14.4881Z" fill="black"/></svg></button>'
                } else if (selectedSubMenuIcon == 'triangle') {
                    var subMenuIcon =
                        '<button class="dropdown-icon"><svg class="dropdown-menu-icon" width="26" height="15" viewBox="0 0 26 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.16094 0H23.5318C25.4534 0 26.4142 2.32565 25.0583 3.68153L14.3729 14.367C13.5288 15.211 12.1639 15.211 11.3289 14.367L0.634452 3.68153C-0.721429 2.32565 0.239361 0 2.16094 0Z" fill="black"/></svg></button>'
                } else if (selectedSubMenuIcon == 'plus') {
                    var subMenuIcon =
                        '<button class="dropdown-icon"><svg class="dropdown-menu-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.9286 5.89286H9.10714V1.07143C9.10714 0.479799 8.62734 0 8.03571 0H6.96429C6.37266 0 5.89286 0.479799 5.89286 1.07143V5.89286H1.07143C0.479799 5.89286 0 6.37266 0 6.96429V8.03571C0 8.62734 0.479799 9.10714 1.07143 9.10714H5.89286V13.9286C5.89286 14.5202 6.37266 15 6.96429 15H8.03571C8.62734 15 9.10714 14.5202 9.10714 13.9286V9.10714H13.9286C14.5202 9.10714 15 8.62734 15 8.03571V6.96429C15 6.37266 14.5202 5.89286 13.9286 5.89286Z" fill="black"/></svg></button>'
                } else {
                    var subMenuIcon =
                        '<button class="dropdown-icon"><svg class="dropdown-menu-icon" width="25" height="15" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.398 14.6021L0.397895 3.60198C-0.132632 3.07145 -0.132632 2.21134 0.397895 1.68087L1.68088 0.397882C2.2105 -0.131739 3.06886 -0.132758 3.59973 0.395617L12.3586 9.11344L21.1174 0.395617C21.6483 -0.132758 22.5066 -0.131739 23.0362 0.397882L24.3192 1.68087C24.8498 2.21139 24.8498 3.07151 24.3192 3.60198L13.3192 14.6021C12.7886 15.1326 11.9285 15.1326 11.398 14.6021Z" fill="black"/></svg></button>'
                }
                $('.cozy-navigation li:not(:has(.dropdown-icon))').each(function () {
                    var childItems = $(this).find('li')
                    if (childItems.length > 0) {
                        $(this).children('a').append(subMenuIcon)
                    }
                })
                $scope
                    .find('.cozy-responsive-navigation .toggle-button')
                    .unbind('click')
                    .click(function (event) {
                        var closeButton = $scope.find('.close-button')
                        event.stopPropagation()
                        var toggle_button = $(this)
                        var nav_container = toggle_button.next('.cozy-navigation-container')
                        $scope
                            .find('.cozy-responsive-navigation .toggle-button')
                            .not(toggle_button)
                            .removeClass('active')
                        nav_container.slideToggle(0).toggleClass('active')
                        toggle_button.toggleClass('active')
                        closeButton.toggleClass('active')
                    })

                $scope.find('.close-button').click(function (event) {
                    var toggleButton = $(this).next('.toggle-button')
                    $(this).toggleClass('active')
                    toggleButton.removeClass('active')
                    toggleButton.next('.cozy-navigation-container').removeClass('active').hide()
                })
                function handleResponsiveNavigation() {
                    const recentSize = jQuery(window).width()
                    $('.cozy-responsive-navigation').each(function () {
                        const elementWidth = $(this).attr('data-ctResponsiveSize')
                        let currentScreenSize
                        switch (elementWidth) {
                            case 'ct-responsive-tablet':
                                currentScreenSize = 1025
                                break
                            case 'ct-responsive-mobile':
                                currentScreenSize = 768
                                break
                            case 'ct-responsive-always':
                                currentScreenSize = 99999
                                break
                            case 'responsive-none':
                                currentScreenSize = 1
                                break
                            default:
                                currentScreenSize = elementWidth
                        }
                        //alert(currentScreenSize);
                        if (recentSize < currentScreenSize) {
                            $(this)
                                .css('display', 'block')
                                .siblings('.cozy-main-navigation')
                                .css('display', 'none')
                        } else {
                            $(this)
                                .css('display', 'none')
                                .siblings('.cozy-main-navigation')
                                .css('display', 'block')
                        }
                    })
                }

                jQuery(window).on('resize', handleResponsiveNavigation)
                handleResponsiveNavigation()

                $(document).click(function (event) {
                    var target = $(event.target)
                    if (!target.closest('.cozy-addons-nav-menu.event-click li').length) {
                        $('ul').removeClass('visible')
                    }
                })
                $scope.find('.cozy-addons-nav-menu.event-click').each(function () {
                    var menu = $(this)
                    menu.find('ul li a .dropdown-icon').click(function (e) {
                        e.preventDefault()
                        var submenu = $(this).closest('a').siblings('ul')
                        menu.find('.cozy-addons-nav-menu.event-click')
                            .not(submenu)
                            .removeClass('visible')
                        submenu.toggleClass('visible')
                        e.stopPropagation()
                    })
                })

                $scope
                    .find('.cozy-addons-nav-menu.event-hover .cozy-responsive-navigation')
                    .each(function () {
                        var menu = $(this)
                        menu.find('ul li a .dropdown-icon').click(function (e) {
                            e.preventDefault()
                            var submenu = $(this).closest('a').siblings('ul')
                            menu.find('.cozy-responsive-navigation')
                                .not(submenu)
                                .removeClass('visible')
                                .css('display', 'none !important')
                            submenu.toggleClass('visible').css('display', 'block !important')
                            e.stopPropagation()
                        })
                    })

                $scope
                    .find('.cozy-addons-nav-menu.event-click .cozy-responsive-navigation')
                    .each(function () {
                        var menu = $(this)
                        menu.find('ul li a .dropdown-icon').click(function (e) {
                            e.preventDefault()
                            var submenu = $(this).closest('a').siblings('ul')
                            menu.find('.cozy-responsive-navigation')
                                .not(submenu)
                                .css('display', 'none')
                            submenu.css('display', 'block')
                            e.stopPropagation()
                        })
                    })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-mini-cart.default',
            function ($scope, $) {
                if (!$scope.find('.cozy-addons-menu-cart a').attr('href')) {
                    if ($('.cozy-popup').length <= 0) {
                        $('body').before("<div class='cozy-popup'></div>")
                    }
                    $scope.find('.cozy-addons-menu-cart a').click(function () {
                        $scope.find('.cozy-sidebar-panel-wrapper').addClass('popup-visible')
                        $('.cozy-popup').addClass('popup-visible')
                        $scope.find('.cozy-close-icon-wrapper').toggleClass('active')
                        $('body').addClass('overflow-hidden')
                    })
                }

                $scope.find('.cozy-close-icon-wrapper').click(function (e) {
                    $(this).removeClass('active')
                    $scope.find('.cozy-sidebar-panel-wrapper').removeClass('popup-visible')
                    $('.cozy-popup').removeClass('popup-visible')
                    $('body').removeClass('overflow-hidden')
                })

                $(document).on('mouseup', function (event) {
                    var target = event.target
                    var myDiv = $scope.find('.cozy-menu-sidebar-panel')[0]
                    if (target !== myDiv && !$.contains(myDiv, target)) {
                        $scope.find('.cozy-sidebar-panel-wrapper').removeClass('popup-visible')
                        $('.cozy-popup').removeClass('popup-visible')
                        $('body').removeClass('overflow-hidden')
                    }
                })
                $scope
                    .find('.cozy-menu-sidebar-panel .cozy-close-icon-wrapper')
                    .click(function (event) {
                        $scope.find('.cozy-sidebar-panel-wrapper').removeClass('popup-visible')
                        $('.cozy-popup').removeClass('popup-visible')
                        $('body').removeClass('overflow-hidden')
                    })

                $('.cozy-cart-remove-product').click(removeCartItem)
                function removeCartItem() {
                    var cart_item_key = $(this).attr('data-cart_item_key')
                    var empty_cart_text = $('.cozy-menu-sidebar-panel').attr('data-empty_cart_text')

                    var data = {
                        action: 'remove_cart_item',
                        cart_item_key: cart_item_key,
                        empty_cart_text: empty_cart_text
                    }
                    var ajax_url = ajax_object.ajax_url
                    $.post(ajax_url, data, function (response) {
                        if (response.success) {
                            $('.cozy-cart-subtotal').html(response.data.cart_subtotal)
                            $('.cozy-cart-items-count').html(response.data.cart_count)

                            $('.cozy-minicart-wrapper').html(response.data.cart_html)
                            $('.cozy-minicart-wrapper .plus').on('click', increaseQuantity)
                            $('.cozy-minicart-wrapper .minus').on('click', decreaseQuantity)
                            $('.cozy-cart-remove-product').on('click', removeCartItem)
                            if (response.data.cart_count == 0) {
                                $('.cozy-menu-sidebar-panel').append(response.data.empty_cart_html)
                            }
                        } else {
                            console.log(response.data.error)
                        }
                    })
                }

                $('.cozy-minicart-wrapper .plus').on('click', increaseQuantity)
                $('.cozy-minicart-wrapper .minus').on('click', decreaseQuantity)

                function increaseQuantity() {
                    var cartItemKey = $(this).attr('data-cart_item_key')
                    var quantity = parseInt($(this).siblings('.quantity').text())

                    updateCartItemQuantity(cartItemKey, ++quantity, $(this))
                }

                function decreaseQuantity() {
                    var cartItemKey = $(this).attr('data-cart_item_key')
                    var quantity = parseInt($(this).siblings('.quantity').text())

                    updateCartItemQuantity(cartItemKey, --quantity, $(this))
                }

                function updateCartItemQuantity(productKey, quantity, element) {
                    var data = {
                        action: 'update_cart_item_quantity',
                        product_key: productKey,
                        quantity: quantity
                    }

                    var ajax_url = ajax_object.ajax_url

                    $.post(ajax_url, data, function (response) {
                        if (response.success) {
                            // Cart item quantity updated successfully
                            // You can perform any additional actions or refresh the cart contents if needed
                            element.siblings('.quantity').html(response.data.item_quantity)
                            element
                                .parent()
                                .parent()
                                .siblings('.total-price')
                                .html(response.data.product_price)
                            $('.cozy-cart-subtotal').html(response.data.cart_subtotal)
                            $('.cozy-cart-items-count').html(response.data.cart_count)
                        } else {
                            // Failed to update cart item quantity
                            console.log(response.data.error)
                        }
                    })
                }

                $('.add_to_cart_button').on('click', addToCart)
                function addToCart() {
                    var product_id = $(this).attr('data-product_id')
                    var data = {
                        action: 'add_to_cart',
                        product_id: product_id
                    }
                    var ajax_url = ajax_object.ajax_url
                    $.post(ajax_url, data, function (response) {
                        if (response.success) {
                            if (response.data.initial_cart_count == 0) {
                                $('.cozy-menu-sidebar-panel')
                                    .find('.empty-cart')
                                    .removeClass('show-empty-cart')
                                $('.cozy-menu-sidebar-panel')
                                    .find('.empty-cart')
                                    .addClass('hide-empty-cart')
                            }
                            $('.cozy-minicart-wrapper').html(response.data.cart_html)

                            $('.cozy-minicart-wrapper .plus').on('click', increaseQuantity)
                            $('.cozy-minicart-wrapper .minus').on('click', decreaseQuantity)
                            $('.cozy-cart-remove-product').on('click', removeCartItem)
                        }
                    })
                }
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        const selectedSection = $('.ct-sticky-section-enabled-yes')
        if (selectedSection.length > 0) {
            $(window).scroll(function () {
                var scrollTop = parseInt($(window).scrollTop())
                var stickySection = $('.ct-sticky-section-enabled-yes')
                var finalStikcyTop = parseInt(stickySection.offset().top)
                //console.log(finalStikcyTop);
                if (finalStikcyTop > 1 && scrollTop >= finalStikcyTop) {
                    stickySection.addClass('ct-section-scrollup')
                } else {
                    stickySection.removeClass('ct-section-scrollup')
                }
            })
        }
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-sidebar-panel.default',
            function ($scope, $) {
                if ($('.cozy-popup').length <= 0) {
                    $('body').before("<div class='cozy-popup'></div>")
                }
                $('.cozy-addons-sidebar-panel .display-icon').click(function () {
                    $scope
                        .find('.cozy-sidebar-panel-wrapper.display-right')
                        .addClass('popup-visible-right')
                    $scope
                        .find('.cozy-sidebar-panel-wrapper.display-left')
                        .addClass('popup-visible-left')
                    $('.cozy-popup').addClass('popup-visible')
                    $('body').addClass('overflow-hidden')
                })

                $(document).on('mouseup', function (event) {
                    var target = event.target
                    var myDiv = $scope.find('.cozy-menu-sidebar-panel')[0]
                    if (target !== myDiv && !$.contains(myDiv, target)) {
                        $scope
                            .find('.cozy-sidebar-panel-wrapper.display-right')
                            .removeClass('popup-visible-right')
                        $scope
                            .find('.cozy-sidebar-panel-wrapper.display-left')
                            .removeClass('popup-visible-left')
                        $('.cozy-popup').removeClass('popup-visible')
                        $('body').removeClass('overflow-hidden')
                    }
                })

                $scope
                    .find('.cozy-menu-sidebar-panel .cozy-close-icon-wrapper')
                    .click(function (event) {
                        $scope
                            .find('.cozy-sidebar-panel-wrapper.display-right')
                            .removeClass('popup-visible-right')
                        $scope
                            .find('.cozy-sidebar-panel-wrapper.display-left')
                            .removeClass('popup-visible-left')
                        $('.cozy-popup').removeClass('popup-visible')
                        $('body').removeClass('overflow-hidden')
                    })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-menu-search.default',
            function ($scope, $) {
                if (
                    $('.cozy-popup').length <= 0 &&
                    $('.cozy-addons-menu-search .cozy-searchbox.display-full-screen').length > 0
                ) {
                    $('body').before("<div class='cozy-popup'></div>")
                }

                function toggleDisplayBlockClass() {
                    $scope
                        .find('.cozy-addons-menu-search .cozy-searchbox')
                        .toggleClass('display-block')
                }

                $scope.find('.cozy-addons-menu-search .cozy-search-icon').click(function () {
                    toggleDisplayBlockClass()
                    $(this).toggleClass('active')
                    if (
                        $scope.find('.cozy-addons-menu-search .cozy-searchbox.display-full-screen')
                            .length > 0
                    ) {
                        $('.cozy-popup').addClass('popup-visible')
                        $('body').addClass('overflow-hidden')
                    }
                })

                const elementorMaxWidth = $('.elementor-container').css('max-width')
                var elementorWidth = $('.elementor-container').width()
                $scope
                    .find(
                        '.cozy-addons-menu-search .cozy-searchbox.display-default .cozy-form-holder'
                    )
                    .css('max-width', elementorMaxWidth)
                $scope
                    .find(
                        '.cozy-addons-menu-search .cozy-searchbox.display-default .cozy-form-holder'
                    )
                    .css('width', elementorWidth)

                $('.cozy-popup').click(function (event) {
                    $scope
                        .find('.cozy-addons-menu-search .cozy-searchbox')
                        .removeClass('display-block')
                    $('.cozy-popup').removeClass('popup-visible')
                    $('body').removeClass('overflow-hidden')
                    // $(".cozy-addons-menu-search .cozy-search-icon").toggleClass("active");
                })

                $(window).click(function (event) {
                    const myDiv = $scope.find(
                        '.cozy-addons-menu-search .cozy-searchbox.display-default'
                    )
                    var target = event.target
                    if (
                        !$(target).is('.cozy-addons-menu-search i') &&
                        !$(target).is(
                            '.cozy-addons-menu-search .cozy-searchbox.display-default input'
                        )
                    ) {
                        myDiv.removeClass('display-block')
                        $('.cozy-addons-menu-search .cozy-search-icon.active').toggleClass('active')
                    }
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-dynamic-timezone.default',
            function ($scope, $) {
                function updateTime() {
                    var now = new Date()
                    var timeFormat = $scope
                        .find('.cozy-addons-dynamic-timezone')
                        .attr('data-time_format')
                    var flag
                    if (timeFormat) {
                        flag = true
                    } else {
                        flag = false
                    }
                    var options = {
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: flag
                    }
                    var timeString = now.toLocaleTimeString(undefined, options)
                    document.getElementById('current-time').innerHTML = timeString

                    setTimeout(updateTime, 1000) // Update every second
                }

                updateTime()
            }
        )
    })
    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-toggle-content.default',
            function ($scope, $) {
                var toggleBtns = $('.cozy-addons-content-toggle button')
                if (toggleBtns.length > 0) {
                    $('.cozy-addons-content-toggle button:first-child').addClass('active')
                }
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-events-list.default',
            function ($scope, $) {
                $scope.find('.cozy-addons-events').each(function () {
                    const eventCarousel = $(this).find('#cozyEventCarousel')
                    var eventSlidePerView = eventCarousel.attr('data-slidePerView')
                    var carouselGridGap = parseInt(eventCarousel.attr('data-carouselColumnGap'))
                    if (carouselGridGap >= 1) {
                        var currentGridGap = carouselGridGap
                    } else {
                        currentGridGap = 0
                    }
                    if (eventSlidePerView < 3) {
                        var respItemSlide = eventSlidePerView
                    } else {
                        var respItemSlide = 3
                    }
                    if (eventSlidePerView < 2) {
                        var mobileItemSlide = eventSlidePerView
                    } else {
                        var mobileItemSlide = 2
                    }
                    var eventSlider = new Swiper(eventCarousel[0], {
                        spaceBetween: currentGridGap,
                        slidesPerView: 1,
                        roundLengths: true,
                        loop: true,
                        autoplay: {
                            delay: 2500,
                            disableOnInteraction: false
                        },
                        pagination: {
                            el: '.cozy-swiper-pagination',
                            dynamicBullets: false,
                            clickable: true
                        },
                        navigation: {
                            nextEl: '.cozy-slide-next',
                            prevEl: '.cozy-slide-prev',
                            clickable: true
                        },
                        breakpoints: {
                            480: {
                                slidesPerView: 1
                            },
                            767: {
                                slidesPerView: mobileItemSlide
                            },
                            1024: {
                                slidesPerView: respItemSlide
                            },
                            1180: {
                                slidesPerView: eventSlidePerView
                            }
                        }
                    })
                })
            }
        )
    })

    $(window).on('elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction(
            'frontend/element_ready/cozy-addons-menu-account.default',
            function ($scope, $) {
                if ($('.cozy-popup').length <= 0) {
                    $('body').before("<div class='cozy-popup'></div>")
                }

                $scope.find('.cozy-login-label').click(function () {
                    $scope.find('.cozy-login-form').addClass('display-form')
                    $('.cozy-popup').addClass('popup-visible')
                    $('body').addClass('overflow-hidden')
                })

                $scope.find('.cozy-login-form .close-icon').click(function () {
                    $scope.find('.cozy-login-form').removeClass('display-form')
                    $('.cozy-popup').removeClass('popup-visible')
                    $('body').removeClass('overflow-hidden')
                })

                $('.cozy-popup').click(function () {
                    $scope.find('.cozy-login-form').removeClass('display-form')
                    $('.cozy-popup').removeClass('popup-visible')
                    $('body').removeClass('overflow-hidden')
                })

                if (
                    $scope.find('.cozy-login-form .woocommerce-notices-wrapper').children().length >
                    0
                ) {
                    $scope.find('.cozy-login-form').addClass('display-form')
                    $('.cozy-popup').addClass('popup-visible')
                    $('body').addClass('overflow-hidden')
                }
            }
        )
    })
})(jQuery)
function openContent(evt, contentTitle) {
    var i, tabcontent
    tabcontent = document.getElementsByClassName('cozy-toggle-content')
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none'
    }
    tablinks = document.getElementsByClassName('cozy-toggle-button')
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '')
    }
    document.getElementById(contentTitle).style.display = 'block'
    evt.currentTarget.className += ' active'
}
