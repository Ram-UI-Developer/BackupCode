import React from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()

    const onLoginHandler = () => {
        window.location = '/login'
        // navigate('/login')
        localStorage.setItem('changePasswordMessage', '')
        // window.location.reload()
    }

    const onPackageHandler = () => {
        navigate('/packages')
    }

    const onHomeHandler = () => {
        navigate('/')
        window.location.reload()
    }

    const navItems = [
        { label: 'Home', onClick: () => onHomeHandler() },
        { label: 'Packages', onClick: () => onPackageHandler() }
    ]

    return (
        <div>
           
                <div class="hfeed site" id="page">
                    <div id="content" class="site-content">
                        <div class="ast-container">
                            <div id="primary" class="content-area primary">
                                <main id="main" class="site-main">
                                    <article
                                        class="post-371 page type-page status-publish ast-article-single"
                                        id="post-371"
                                        itemtype="https://schema.org/CreativeWork"
                                        itemscope="itemscope"
                                    >
                                        <header class="entry-header ast-no-thumbnail ast-no-title ast-header-without-markup"></header>

                                        <div class="entry-content clear" itemprop="text">
                                            <div
                                                data-elementor-type="wp-page"
                                                data-elementor-id="371"
                                                class="elementor elementor-371"
                                                data-elementor-post-type="page"
                                            >
                                                <div
                                                    class="elementor-element elementor-element-7b62bd29 e-flex e-con-boxed e-con e-parent"
                                                    data-id="7b62bd29"
                                                    data-element_type="container"
                                                    data-settings='{"background_background":"classic","sticky":"top","sticky_on":["desktop","tablet","mobile"],"sticky_offset":0,"sticky_effects_offset":0}'
                                                >
                                                    <div class="e-con-inner">
                                                        <div
                                                            class="elementor-element elementor-element-429bbfbf elementor-widget elementor-widget-image"
                                                            data-id="429bbfbf"
                                                            data-element_type="widget"
                                                            data-widget_type="image.default"
                                                        >
                                                            <div class="elementor-widget-container">
                                                                <a href="/">
                                                                    <img
                                                                        fetchpriority="high"
                                                                        decoding="async"
                                                                        width="681"
                                                                        height="210"
                                                                        src="/wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1.png"
                                                                        class="attachment-full size-full wp-image-300"
                                                                        alt=""
                                                                        srcset="/wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1.png 681w, /wp-content/uploads/2024/02/Blue-Modern-Business-Corporate-Logo-1-300x93.png 300w"
                                                                        sizes="(max-width: 681px) 100vw, 681px"
                                                                    />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        {navItems.map((item) => (
                                                            <div
                                                                key={item.label}
                                                                className="elementor-element elementor-widget elementor-widget-image"
                                                            >
                                                                <div className="elementor-widget-container">
                                                                    <div
                                                                        className="home-nav-items"
                                                                        onClick={item.onClick}
                                                                    >
                                                                        {item.label}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div
                                                            class="elementor-element elementor-element-111bcbc5 e-flex e-con-boxed e-con e-child"
                                                            data-id="111bcbc5"
                                                            data-element_type="container"
                                                        >
                                                            <div class="e-con-inner">
                                                                <div
                                                                    data-toggle="modal"
                                                                    data-target="#exampleModalCenter"
                                                                    class="elementor-element  elementor-widget__width-auto  elementor-widget elementor-widget-button"
                                                                    data-id="e1f5a9d"
                                                                    data-element_type="widget"
                                                                    data-widget_type="button.default"
                                                                >
                                                                   {location.pathname == '/login' ? ' ' : <div class="elementor-widget-container">
                                                                        <div
                                                                            class="elementor-button-wrapper"
                                                                            onClick={() =>
                                                                                onLoginHandler()
                                                                            }
                                                                        >
                                                                            <a
                                                                                class="elementor-button elementor-size-sm elementor-animation-shrink"
                                                                                role="button"
                                                                            >
                                                                                <span class="elementor-button-content-wrapper">
                                                                                    <span class="">
                                                                                        Log in
                                                                                    </span>
                                                                                </span>
                                                                            </a>
                                                                        </div>
                                                                    </div>}
                                                                </div>

                                                                <div
                                                                    class="elementor-element  elementor-widget__width-auto  elementor-widget elementor-widget-button"
                                                                    data-id="b8d682a"
                                                                    data-element_type="widget"
                                                                    data-widget_type="button.default"
                                                                >
                                                                    <div class="elementor-widget-container">
                                                                        <div
                                                                            class="elementor-button-wrapper"
                                                                            onClick={() =>
                                                                                onPackageHandler()
                                                                            }
                                                                        >
                                                                            <a
                                                                                class="elementor-button elementor-size-sm elementor-animation-shrink"
                                                                                role="button"
                                                                            >
                                                                                <span class="elementor-button-content-wrapper">
                                                                                    <span class="">
                                                                                        Enroll For
                                                                                        Free
                                                                                    </span>
                                                                                </span>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            
        </div>
    )
}

export default Header
