import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const FooterNew = () => {
    const navigate = useNavigate()

    const handleClickPrivacy = () => {
        navigate('/privacyPolicy')
        window.location.reload()
    }

    const handleClickTerms = () => {
        navigate('/termsAndConditions')
        window.location.reload()
    }
    return (
        <section
            class="elementor-section elementor-top-section elementor-element elementor-element-79ca2abf elementor-section-boxed elementor-section-height-default elementor-section-height-default ct-sticky-section-enabled-no"
            data-id="79ca2abf"
            data-element_type="section"
            data-settings='{"background_background":"classic"}'
        >
            <div class="elementor-container elementor-column-gap-default">
                <div
                    class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-4d223938"
                    data-id="4d223938"
                    data-element_type="column"
                >
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div
                            class="elementor-element elementor-element-1cf62372 elementor-widget__width-auto elementor-widget elementor-widget-elementskit-header-info"
                            data-id="1cf62372"
                            data-element_type="widget"
                            data-widget_type="elementskit-header-info.default"
                        >
                            <div class="elementor-widget-container">
                                <div>
                                    <ul class="ekit-header-info">
                                        <li>
                                            <a>
                                                <img
                                                    src="/wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1.png"
                                                    className="homepage"
                                                    alt="Workshine"
                                                    style={{ marginTop: '-6px' }}
                                                />
                                                &copy; <b><a href='https://infyshine.com/' target="_blank">Infyshine Technologies</a></b>
                                                &ensp;All Rights Reserved.
                                            </a>
                                        </li>
                                        <li
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <Link
                                                onClick={handleClickPrivacy}
                                                style={{
                                                    fontSize: '12px',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Our privacy policy
                                            </Link>
                                            <Link
                                                onClick={handleClickTerms}
                                                style={{
                                                    fontSize: '12px',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Terms and Conditions
                                            </Link>
                                        </li>
                                    </ul>
                                </div>{' '}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FooterNew
