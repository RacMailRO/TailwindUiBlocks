/**
 * Demo Page Templates
 * Showcase various component nesting scenarios and advanced features
 */
class DemoTemplateManager {
    constructor() {
        this.templates = new Map();
        this.orchestrator = null;
        this.initializeTemplates();
    }

    /**
     * Set component orchestrator
     */
    setOrchestrator(orchestrator) {
        this.orchestrator = orchestrator;
    }

    /**
     * Initialize demo templates
     */
    initializeTemplates() {
        // E-commerce Product Page Template
        this.registerTemplate('ecommerce-product', {
            name: 'E-commerce Product Page',
            description: 'Complex product page with nested components, conditional rendering, and dynamic lists',
            category: 'E-commerce',
            difficulty: 'Advanced',
            features: ['Deep Nesting', 'Conditional Components', 'Dynamic Lists', 'State Management'],
            structure: this.createEcommerceProductTemplate()
        });

        // Dashboard Template
        this.registerTemplate('analytics-dashboard', {
            name: 'Analytics Dashboard',
            description: 'Interactive dashboard with smart containers and performance optimization',
            category: 'Dashboard',
            difficulty: 'Expert',
            features: ['Smart Containers', 'Performance Monitoring', 'Event Bridges', 'Real-time Updates'],
            structure: this.createAnalyticsDashboardTemplate()
        });

        // Blog Layout Template
        this.registerTemplate('blog-layout', {
            name: 'Blog Layout',
            description: 'Responsive blog layout with dynamic content and nested comments',
            category: 'Content',
            difficulty: 'Intermediate',
            features: ['Responsive Design', 'Dynamic Lists', 'Nested Comments', 'Content Management'],
            structure: this.createBlogLayoutTemplate()
        });

        // Form Builder Template
        this.registerTemplate('dynamic-form', {
            name: 'Dynamic Form Builder',
            description: 'Complex form with conditional fields and validation',
            category: 'Forms',
            difficulty: 'Advanced',
            features: ['Conditional Fields', 'Dynamic Validation', 'State Containers', 'Form Logic'],
            structure: this.createDynamicFormTemplate()
        });

        // Landing Page Template
        this.registerTemplate('landing-page', {
            name: 'Modern Landing Page',
            description: 'Marketing landing page with hero sections and testimonials',
            category: 'Marketing',
            difficulty: 'Beginner',
            features: ['Hero Sections', 'Testimonials', 'Call-to-Actions', 'Responsive Grid'],
            structure: this.createLandingPageTemplate()
        });

        // Admin Panel Template
        this.registerTemplate('admin-panel', {
            name: 'Admin Control Panel',
            description: 'Administrative interface with complex data tables and management features',
            category: 'Admin',
            difficulty: 'Expert',
            features: ['Data Tables', 'User Management', 'Permission Controls', 'System Monitoring'],
            structure: this.createAdminPanelTemplate()
        });

        // Portfolio Template
        this.registerTemplate('creative-portfolio', {
            name: 'Creative Portfolio',
            description: 'Interactive portfolio with project galleries and animations',
            category: 'Portfolio',
            difficulty: 'Intermediate',
            features: ['Image Galleries', 'Project Showcases', 'Contact Forms', 'Smooth Animations'],
            structure: this.createCreativePortfolioTemplate()
        });
    }

    /**
     * Register template
     */
    registerTemplate(id, template) {
        this.templates.set(id, {
            id,
            ...template,
            created: Date.now()
        });
    }

    /**
     * Get template
     */
    getTemplate(id) {
        return this.templates.get(id);
    }

    /**
     * Get all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values())
            .filter(template => template.category === category);
    }

    /**
     * Create E-commerce Product Template
     */
    createEcommerceProductTemplate() {
        return {
            root: {
                id: 'ecommerce-root',
                type: 'smart-container',
                component: 'smart-container',
                category: 'layout',
                subcategory: 'smart',
                props: {
                    adaptiveLayout: true,
                    layoutStrategy: 'ecommerce'
                },
                children: [
                    // Header
                    {
                        id: 'ecommerce-header',
                        type: 'container',
                        component: 'header',
                        category: 'layout',
                        subcategory: 'semantic',
                        props: {
                            className: 'bg-white shadow-sm border-b'
                        },
                        children: [
                            {
                                id: 'nav-container',
                                type: 'container',
                                component: 'flex-row',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'
                                },
                                children: [
                                    {
                                        id: 'logo',
                                        type: 'component',
                                        component: 'logo',
                                        category: 'ui',
                                        subcategory: 'branding'
                                    },
                                    {
                                        id: 'nav-menu',
                                        type: 'dynamic-list',
                                        component: 'navigation',
                                        category: 'ui',
                                        subcategory: 'navigation',
                                        props: {
                                            items: [
                                                { label: 'Products', href: '/products' },
                                                { label: 'Categories', href: '/categories' },
                                                { label: 'About', href: '/about' },
                                                { label: 'Contact', href: '/contact' }
                                            ]
                                        }
                                    },
                                    {
                                        id: 'cart-icon',
                                        type: 'conditional',
                                        component: 'cart-indicator',
                                        category: 'ui',
                                        subcategory: 'ecommerce',
                                        props: {
                                            condition: 'state.cartItems.length > 0',
                                            conditionType: 'expression'
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    // Main Content
                    {
                        id: 'main-content',
                        type: 'container',
                        component: 'main',
                        category: 'layout',
                        subcategory: 'semantic',
                        props: {
                            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
                        },
                        children: [
                            {
                                id: 'product-section',
                                type: 'container',
                                component: 'grid',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'
                                },
                                children: [
                                    // Product Images
                                    {
                                        id: 'product-gallery',
                                        type: 'smart-container',
                                        component: 'image-gallery',
                                        category: 'ui',
                                        subcategory: 'media',
                                        props: {
                                            adaptiveLayout: true,
                                            images: [
                                                { src: '/images/product-1.jpg', alt: 'Product view 1' },
                                                { src: '/images/product-2.jpg', alt: 'Product view 2' },
                                                { src: '/images/product-3.jpg', alt: 'Product view 3' }
                                            ]
                                        },
                                        children: [
                                            {
                                                id: 'main-image',
                                                type: 'component',
                                                component: 'image',
                                                category: 'ui',
                                                subcategory: 'media'
                                            },
                                            {
                                                id: 'thumbnail-list',
                                                type: 'dynamic-list',
                                                component: 'thumbnail-list',
                                                category: 'ui',
                                                subcategory: 'media',
                                                props: {
                                                    virtualized: false,
                                                    itemTemplate: 'thumbnail'
                                                }
                                            }
                                        ]
                                    },
                                    // Product Info
                                    {
                                        id: 'product-info',
                                        type: 'state-container',
                                        component: 'product-details',
                                        category: 'ui',
                                        subcategory: 'ecommerce',
                                        props: {
                                            initialState: {
                                                selectedVariant: null,
                                                quantity: 1,
                                                inCart: false
                                            }
                                        },
                                        children: [
                                            {
                                                id: 'product-title',
                                                type: 'component',
                                                component: 'heading',
                                                category: 'ui',
                                                subcategory: 'typography',
                                                props: {
                                                    level: 1,
                                                    text: 'Premium Product Title'
                                                }
                                            },
                                            {
                                                id: 'product-price',
                                                type: 'conditional',
                                                component: 'price-display',
                                                category: 'ui',
                                                subcategory: 'ecommerce',
                                                props: {
                                                    condition: 'state.selectedVariant',
                                                    conditionType: 'state',
                                                    trueContent: '<span class="text-3xl font-bold text-gray-900">$299.99</span>',
                                                    falseContent: '<span class="text-3xl font-bold text-gray-900">From $199.99</span>'
                                                }
                                            },
                                            {
                                                id: 'variant-selector',
                                                type: 'dynamic-list',
                                                component: 'variant-options',
                                                category: 'ui',
                                                subcategory: 'ecommerce',
                                                props: {
                                                    items: [
                                                        { id: 'small', label: 'Small', price: 199.99 },
                                                        { id: 'medium', label: 'Medium', price: 249.99 },
                                                        { id: 'large', label: 'Large', price: 299.99 }
                                                    ],
                                                    itemTemplate: 'variant-option'
                                                }
                                            },
                                            {
                                                id: 'add-to-cart',
                                                type: 'conditional',
                                                component: 'add-to-cart-button',
                                                category: 'ui',
                                                subcategory: 'ecommerce',
                                                props: {
                                                    condition: 'state.selectedVariant && !state.inCart',
                                                    conditionType: 'expression',
                                                    trueContent: '<button class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700">Add to Cart</button>',
                                                    falseContent: '<button class="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg" disabled>Select Variant</button>'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            // Product Description Tabs
                            {
                                id: 'product-tabs',
                                type: 'state-container',
                                component: 'tab-container',
                                category: 'ui',
                                subcategory: 'navigation',
                                props: {
                                    initialState: { activeTab: 'description' }
                                },
                                children: [
                                    {
                                        id: 'tab-navigation',
                                        type: 'dynamic-list',
                                        component: 'tab-nav',
                                        category: 'ui',
                                        subcategory: 'navigation',
                                        props: {
                                            items: [
                                                { id: 'description', label: 'Description' },
                                                { id: 'specifications', label: 'Specifications' },
                                                { id: 'reviews', label: 'Reviews' }
                                            ]
                                        }
                                    },
                                    {
                                        id: 'tab-content',
                                        type: 'conditional',
                                        component: 'tab-content',
                                        category: 'ui',
                                        subcategory: 'content',
                                        props: {
                                            condition: 'state.activeTab',
                                            conditionType: 'state'
                                        },
                                        children: [
                                            {
                                                id: 'description-content',
                                                type: 'conditional',
                                                component: 'description',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    condition: 'state.activeTab === "description"',
                                                    conditionType: 'expression'
                                                }
                                            },
                                            {
                                                id: 'specifications-content',
                                                type: 'conditional',
                                                component: 'specifications',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    condition: 'state.activeTab === "specifications"',
                                                    conditionType: 'expression'
                                                }
                                            },
                                            {
                                                id: 'reviews-section',
                                                type: 'conditional',
                                                component: 'reviews',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    condition: 'state.activeTab === "reviews"',
                                                    conditionType: 'expression'
                                                },
                                                children: [
                                                    {
                                                        id: 'reviews-list',
                                                        type: 'dynamic-list',
                                                        component: 'review-list',
                                                        category: 'ui',
                                                        subcategory: 'content',
                                                        props: {
                                                            virtualized: true,
                                                            maxVisibleItems: 5,
                                                            items: []
                                                        }
                                                    },
                                                    {
                                                        id: 'review-form',
                                                        type: 'conditional',
                                                        component: 'review-form',
                                                        category: 'ui',
                                                        subcategory: 'forms',
                                                        props: {
                                                            condition: 'user.isLoggedIn',
                                                            conditionType: 'expression'
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            // Related Products
                            {
                                id: 'related-products',
                                type: 'smart-container',
                                component: 'related-products',
                                category: 'ui',
                                subcategory: 'ecommerce',
                                props: {
                                    adaptiveLayout: true,
                                    maxChildren: 8
                                },
                                children: [
                                    {
                                        id: 'related-title',
                                        type: 'component',
                                        component: 'heading',
                                        category: 'ui',
                                        subcategory: 'typography',
                                        props: {
                                            level: 2,
                                            text: 'Related Products'
                                        }
                                    },
                                    {
                                        id: 'related-grid',
                                        type: 'dynamic-list',
                                        component: 'product-grid',
                                        category: 'ui',
                                        subcategory: 'ecommerce',
                                        props: {
                                            virtualized: false,
                                            items: [],
                                            itemTemplate: 'product-card',
                                            maxItems: 8
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    // Footer
                    {
                        id: 'ecommerce-footer',
                        type: 'container',
                        component: 'footer',
                        category: 'layout',
                        subcategory: 'semantic',
                        props: {
                            className: 'bg-gray-900 text-white mt-12'
                        },
                        children: [
                            {
                                id: 'footer-content',
                                type: 'container',
                                component: 'grid',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8'
                                },
                                children: [
                                    {
                                        id: 'footer-company',
                                        type: 'component',
                                        component: 'footer-section',
                                        category: 'ui',
                                        subcategory: 'content'
                                    },
                                    {
                                        id: 'footer-products',
                                        type: 'dynamic-list',
                                        component: 'footer-links',
                                        category: 'ui',
                                        subcategory: 'navigation',
                                        props: {
                                            title: 'Products',
                                            items: [
                                                { label: 'All Products', href: '/products' },
                                                { label: 'New Arrivals', href: '/new' },
                                                { label: 'Sale', href: '/sale' }
                                            ]
                                        }
                                    },
                                    {
                                        id: 'footer-support',
                                        type: 'dynamic-list',
                                        component: 'footer-links',
                                        category: 'ui',
                                        subcategory: 'navigation',
                                        props: {
                                            title: 'Support',
                                            items: [
                                                { label: 'Help Center', href: '/help' },
                                                { label: 'Contact Us', href: '/contact' },
                                                { label: 'Returns', href: '/returns' }
                                            ]
                                        }
                                    },
                                    {
                                        id: 'footer-social',
                                        type: 'dynamic-list',
                                        component: 'social-links',
                                        category: 'ui',
                                        subcategory: 'social',
                                        props: {
                                            title: 'Follow Us',
                                            items: [
                                                { platform: 'facebook', href: '#' },
                                                { platform: 'twitter', href: '#' },
                                                { platform: 'instagram', href: '#' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Create Analytics Dashboard Template
     */
    createAnalyticsDashboardTemplate() {
        return {
            root: {
                id: 'dashboard-root',
                type: 'smart-container',
                component: 'dashboard-layout',
                category: 'layout',
                subcategory: 'smart',
                props: {
                    adaptiveLayout: true,
                    layoutStrategy: 'dashboard',
                    autoOptimize: true
                },
                children: [
                    // Dashboard Header
                    {
                        id: 'dashboard-header',
                        type: 'container',
                        component: 'header',
                        category: 'layout',
                        subcategory: 'semantic',
                        props: {
                            className: 'bg-white shadow-sm border-b'
                        },
                        children: [
                            {
                                id: 'header-content',
                                type: 'container',
                                component: 'flex-row',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'px-6 py-4 flex items-center justify-between'
                                },
                                children: [
                                    {
                                        id: 'dashboard-title',
                                        type: 'component',
                                        component: 'heading',
                                        category: 'ui',
                                        subcategory: 'typography',
                                        props: {
                                            level: 1,
                                            text: 'Analytics Dashboard'
                                        }
                                    },
                                    {
                                        id: 'date-range-selector',
                                        type: 'state-container',
                                        component: 'date-range',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        props: {
                                            initialState: { 
                                                startDate: '2024-01-01',
                                                endDate: '2024-12-31'
                                            }
                                        }
                                    },
                                    {
                                        id: 'refresh-button',
                                        type: 'event-bridge',
                                        component: 'refresh-control',
                                        category: 'ui',
                                        subcategory: 'controls',
                                        props: {
                                            eventMappings: [
                                                { from: 'click', to: 'dashboard:refresh' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    // Main Dashboard Content
                    {
                        id: 'dashboard-main',
                        type: 'container',
                        component: 'main',
                        category: 'layout',
                        subcategory: 'semantic',
                        props: {
                            className: 'flex-1 p-6'
                        },
                        children: [
                            // KPI Cards
                            {
                                id: 'kpi-section',
                                type: 'smart-container',
                                component: 'kpi-grid',
                                category: 'ui',
                                subcategory: 'dashboard',
                                props: {
                                    adaptiveLayout: true,
                                    responsiveBreakpoints: ['sm', 'md', 'lg', 'xl']
                                },
                                children: [
                                    {
                                        id: 'kpi-cards',
                                        type: 'dynamic-list',
                                        component: 'kpi-cards',
                                        category: 'ui',
                                        subcategory: 'dashboard',
                                        props: {
                                            items: [
                                                { 
                                                    title: 'Total Users',
                                                    value: '12,543',
                                                    change: '+12%',
                                                    trend: 'up'
                                                },
                                                {
                                                    title: 'Revenue',
                                                    value: '$45,231',
                                                    change: '+8%',
                                                    trend: 'up'
                                                },
                                                {
                                                    title: 'Conversion Rate',
                                                    value: '3.24%',
                                                    change: '-2%',
                                                    trend: 'down'
                                                },
                                                {
                                                    title: 'Avg. Session',
                                                    value: '2m 34s',
                                                    change: '+15%',
                                                    trend: 'up'
                                                }
                                            ],
                                            itemTemplate: 'kpi-card'
                                        }
                                    }
                                ]
                            },
                            // Charts Section
                            {
                                id: 'charts-section',
                                type: 'container',
                                component: 'grid',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'
                                },
                                children: [
                                    {
                                        id: 'traffic-chart',
                                        type: 'state-container',
                                        component: 'chart-container',
                                        category: 'ui',
                                        subcategory: 'dashboard',
                                        props: {
                                            initialState: {
                                                chartType: 'line',
                                                timeframe: '7d'
                                            }
                                        },
                                        children: [
                                            {
                                                id: 'chart-header',
                                                type: 'container',
                                                component: 'flex-row',
                                                category: 'layout',
                                                subcategory: 'containers',
                                                props: {
                                                    className: 'flex items-center justify-between mb-4'
                                                },
                                                children: [
                                                    {
                                                        id: 'chart-title',
                                                        type: 'component',
                                                        component: 'heading',
                                                        category: 'ui',
                                                        subcategory: 'typography',
                                                        props: {
                                                            level: 3,
                                                            text: 'Website Traffic'
                                                        }
                                                    },
                                                    {
                                                        id: 'chart-controls',
                                                        type: 'dynamic-list',
                                                        component: 'chart-controls',
                                                        category: 'ui',
                                                        subcategory: 'controls',
                                                        props: {
                                                            items: [
                                                                { label: '7D', value: '7d' },
                                                                { label: '30D', value: '30d' },
                                                                { label: '90D', value: '90d' }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'traffic-chart-canvas',
                                                type: 'conditional',
                                                component: 'chart',
                                                category: 'ui',
                                                subcategory: 'visualization',
                                                props: {
                                                    condition: 'state.chartData',
                                                    conditionType: 'state',
                                                    trueContent: '<canvas id="trafficChart" class="w-full h-64"></canvas>',
                                                    falseContent: '<div class="w-full h-64 bg-gray-100 rounded flex items-center justify-center">Loading chart...</div>'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: 'conversion-funnel',
                                        type: 'smart-container',
                                        component: 'funnel-chart',
                                        category: 'ui',
                                        subcategory: 'dashboard',
                                        props: {
                                            adaptiveLayout: true
                                        },
                                        children: [
                                            {
                                                id: 'funnel-title',
                                                type: 'component',
                                                component: 'heading',
                                                category: 'ui',
                                                subcategory: 'typography',
                                                props: {
                                                    level: 3,
                                                    text: 'Conversion Funnel'
                                                }
                                            },
                                            {
                                                id: 'funnel-steps',
                                                type: 'dynamic-list',
                                                component: 'funnel-steps',
                                                category: 'ui',
                                                subcategory: 'visualization',
                                                props: {
                                                    items: [
                                                        { step: 'Visitors', count: 10000, percentage: 100 },
                                                        { step: 'Sign Up', count: 2500, percentage: 25 },
                                                        { step: 'Trial', count: 1000, percentage: 10 },
                                                        { step: 'Purchase', count: 324, percentage: 3.24 }
                                                    ],
                                                    itemTemplate: 'funnel-step'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            // Data Tables Section
                            {
                                id: 'tables-section',
                                type: 'container',
                                component: 'grid',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6'
                                },
                                children: [
                                    {
                                        id: 'top-pages-table',
                                        type: 'state-container',
                                        component: 'data-table',
                                        category: 'ui',
                                        subcategory: 'data',
                                        props: {
                                            initialState: {
                                                sortBy: 'views',
                                                sortOrder: 'desc',
                                                currentPage: 1
                                            }
                                        },
                                        children: [
                                            {
                                                id: 'table-header',
                                                type: 'container',
                                                component: 'flex-row',
                                                category: 'layout',
                                                subcategory: 'containers',
                                                props: {
                                                    className: 'flex items-center justify-between mb-4'
                                                },
                                                children: [
                                                    {
                                                        id: 'table-title',
                                                        type: 'component',
                                                        component: 'heading',
                                                        category: 'ui',
                                                        subcategory: 'typography',
                                                        props: {
                                                            level: 3,
                                                            text: 'Top Pages'
                                                        }
                                                    },
                                                    {
                                                        id: 'table-search',
                                                        type: 'component',
                                                        component: 'search-input',
                                                        category: 'ui',
                                                        subcategory: 'forms',
                                                        props: {
                                                            placeholder: 'Search pages...'
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'pages-table-data',
                                                type: 'dynamic-list',
                                                component: 'data-table-body',
                                                category: 'ui',
                                                subcategory: 'data',
                                                props: {
                                                    virtualized: true,
                                                    maxVisibleItems: 10,
                                                    items: [
                                                        { page: '/home', views: 12543, bounceRate: '32%', avgTime: '2:34' },
                                                        { page: '/products', views: 8921, bounceRate: '28%', avgTime: '3:12' },
                                                        { page: '/about', views: 5432, bounceRate: '45%', avgTime: '1:23' },
                                                        { page: '/contact', views: 2134, bounceRate: '38%', avgTime: '1:45' }
                                                    ],
                                                    itemTemplate: 'table-row'
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        id: 'user-activity-table',
                                        type: 'state-container',
                                        component: 'activity-table',
                                        category: 'ui',
                                        subcategory: 'data',
                                        props: {
                                            initialState: {
                                                filter: 'all',
                                                timeRange: '24h'
                                            }
                                        },
                                        children: [
                                            {
                                                id: 'activity-header',
                                                type: 'container',
                                                component: 'flex-row',
                                                category: 'layout',
                                                subcategory: 'containers',
                                                props: {
                                                    className: 'flex items-center justify-between mb-4'
                                                },
                                                children: [
                                                    {
                                                        id: 'activity-title',
                                                        type: 'component',
                                                        component: 'heading',
                                                        category: 'ui',
                                                        subcategory: 'typography',
                                                        props: {
                                                            level: 3,
                                                            text: 'User Activity'
                                                        }
                                                    },
                                                    {
                                                        id: 'activity-filters',
                                                        type: 'dynamic-list',
                                                        component: 'filter-controls',
                                                        category: 'ui',
                                                        subcategory: 'controls',
                                                        props: {
                                                            items: [
                                                                { label: 'All', value: 'all' },
                                                                { label: 'Active', value: 'active' },
                                                                { label: 'Inactive', value: 'inactive' }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                id: 'activity-list',
                                                type: 'dynamic-list',
                                                component: 'activity-feed',
                                                category: 'ui',
                                                subcategory: 'data',
                                                props: {
                                                    virtualized: true,
                                                    maxVisibleItems: 15,
                                                    items: [],
                                                    itemTemplate: 'activity-item'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Create Blog Layout Template
     */
    createBlogLayoutTemplate() {
        return {
            root: {
                id: 'blog-root',
                type: 'smart-container',
                component: 'blog-layout',
                category: 'layout',
                subcategory: 'smart',
                props: {
                    adaptiveLayout: true,
                    layoutStrategy: 'blog'
                },
                children: [
                    // Blog Header
                    {
                        id: 'blog-header',
                        type: 'container',
                        component: 'header',
                        category: 'layout',
                        subcategory: 'semantic',
                        children: [
                            {
                                id: 'blog-nav',
                                type: 'container',
                                component: 'navigation',
                                category: 'ui',
                                subcategory: 'navigation',
                                children: [
                                    {
                                        id: 'blog-logo',
                                        type: 'component',
                                        component: 'logo',
                                        category: 'ui',
                                        subcategory: 'branding'
                                    },
                                    {
                                        id: 'blog-menu',
                                        type: 'dynamic-list',
                                        component: 'menu',
                                        category: 'ui',
                                        subcategory: 'navigation',
                                        props: {
                                            items: [
                                                { label: 'Home', href: '/' },
                                                { label: 'Articles', href: '/articles' },
                                                { label: 'Categories', href: '/categories' },
                                                { label: 'About', href: '/about' }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    // Blog Content
                    {
                        id: 'blog-main',
                        type: 'container',
                        component: 'main',
                        category: 'layout',
                        subcategory: 'semantic',
                        children: [
                            {
                                id: 'blog-content-grid',
                                type: 'container',
                                component: 'grid',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'grid grid-cols-1 lg:grid-cols-3 gap-8'
                                },
                                children: [
                                    // Main Content
                                    {
                                        id: 'blog-content',
                                        type: 'container',
                                        component: 'section',
                                        category: 'layout',
                                        subcategory: 'containers',
                                        props: {
                                            className: 'lg:col-span-2'
                                        },
                                        children: [
                                            {
                                                id: 'featured-post',
                                                type: 'state-container',
                                                component: 'featured-article',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    initialState: {
                                                        isExpanded: false
                                                    }
                                                }
                                            },
                                            {
                                                id: 'blog-posts',
                                                type: 'dynamic-list',
                                                component: 'blog-posts',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    virtualized: true,
                                                    maxVisibleItems: 10,
                                                    items: [],
                                                    itemTemplate: 'blog-post-card'
                                                }
                                            }
                                        ]
                                    },
                                    // Sidebar
                                    {
                                        id: 'blog-sidebar',
                                        type: 'container',
                                        component: 'aside',
                                        category: 'layout',
                                        subcategory: 'semantic',
                                        children: [
                                            {
                                                id: 'search-widget',
                                                type: 'component',
                                                component: 'search-box',
                                                category: 'ui',
                                                subcategory: 'forms'
                                            },
                                            {
                                                id: 'categories-widget',
                                                type: 'dynamic-list',
                                                component: 'categories-list',
                                                category: 'ui',
                                                subcategory: 'navigation',
                                                props: {
                                                    items: [
                                                        { name: 'Technology', count: 45 },
                                                        { name: 'Design', count: 32 },
                                                        { name: 'Business', count: 28 },
                                                        { name: 'Lifestyle', count: 19 }
                                                    ]
                                                }
                                            },
                                            {
                                                id: 'recent-posts-widget',
                                                type: 'dynamic-list',
                                                component: 'recent-posts',
                                                category: 'ui',
                                                subcategory: 'content',
                                                props: {
                                                    maxVisibleItems: 5,
                                                    items: []
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Create Dynamic Form Template
     */
    createDynamicFormTemplate() {
        return {
            root: {
                id: 'form-root',
                type: 'state-container',
                component: 'dynamic-form',
                category: 'ui',
                subcategory: 'forms',
                props: {
                    initialState: {
                        formData: {},
                        currentStep: 1,
                        isValid: false,
                        errors: {}
                    }
                },
                children: [
                    {
                        id: 'form-header',
                        type: 'container',
                        component: 'header',
                        category: 'layout',
                        subcategory: 'semantic',
                        children: [
                            {
                                id: 'form-title',
                                type: 'component',
                                component: 'heading',
                                category: 'ui',
                                subcategory: 'typography',
                                props: {
                                    level: 1,
                                    text: 'Dynamic Registration Form'
                                }
                            },
                            {
                                id: 'form-progress',
                                type: 'conditional',
                                component: 'progress-bar',
                                category: 'ui',
                                subcategory: 'feedback',
                                props: {
                                    condition: 'state.currentStep > 1',
                                    conditionType: 'expression'
                                }
                            }
                        ]
                    },
                    {
                        id: 'form-content',
                        type: 'container',
                        component: 'form',
                        category: 'ui',
                        subcategory: 'forms',
                        children: [
                            // Step 1: Basic Information
                            {
                                id: 'step-1',
                                type: 'conditional',
                                component: 'form-step',
                                category: 'ui',
                                subcategory: 'forms',
                                props: {
                                    condition: 'state.currentStep === 1',
                                    conditionType: 'expression'
                                },
                                children: [
                                    {
                                        id: 'basic-info-fields',
                                        type: 'container',
                                        component: 'fieldset',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        children: [
                                            {
                                                id: 'name-field',
                                                type: 'component',
                                                component: 'text-input',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    label: 'Full Name',
                                                    required: true,
                                                    validation: 'required|min:2'
                                                }
                                            },
                                            {
                                                id: 'email-field',
                                                type: 'component',
                                                component: 'email-input',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    label: 'Email Address',
                                                    required: true,
                                                    validation: 'required|email'
                                                }
                                            },
                                            {
                                                id: 'phone-field',
                                                type: 'conditional',
                                                component: 'phone-input',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    condition: 'state.formData.requiresPhone',
                                                    conditionType: 'expression',
                                                    label: 'Phone Number'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            // Step 2: Profile Information
                            {
                                id: 'step-2',
                                type: 'conditional',
                                component: 'form-step',
                                category: 'ui',
                                subcategory: 'forms',
                                props: {
                                    condition: 'state.currentStep === 2',
                                    conditionType: 'expression'
                                },
                                children: [
                                    {
                                        id: 'profile-fields',
                                        type: 'container',
                                        component: 'fieldset',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        children: [
                                            {
                                                id: 'user-type-field',
                                                type: 'component',
                                                component: 'select',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    label: 'User Type',
                                                    options: [
                                                        { value: 'individual', label: 'Individual' },
                                                        { value: 'business', label: 'Business' },
                                                        { value: 'organization', label: 'Organization' }
                                                    ]
                                                }
                                            },
                                            {
                                                id: 'business-fields',
                                                type: 'conditional',
                                                component: 'business-info',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    condition: 'state.formData.userType === "business"',
                                                    conditionType: 'expression'
                                                },
                                                children: [
                                                    {
                                                        id: 'company-name',
                                                        type: 'component',
                                                        component: 'text-input',
                                                        category: 'ui',
                                                        subcategory: 'forms',
                                                        props: {
                                                            label: 'Company Name',
                                                            required: true
                                                        }
                                                    },
                                                    {
                                                        id: 'company-size',
                                                        type: 'component',
                                                        component: 'select',
                                                        category: 'ui',
                                                        subcategory: 'forms',
                                                        props: {
                                                            label: 'Company Size',
                                                            options: [
                                                                { value: '1-10', label: '1-10 employees' },
                                                                { value: '11-50', label: '11-50 employees' },
                                                                { value: '51-200', label: '51-200 employees' },
                                                                { value: '200+', label: '200+ employees' }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            // Step 3: Preferences
                            {
                                id: 'step-3',
                                type: 'conditional',
                                component: 'form-step',
                                category: 'ui',
                                subcategory: 'forms',
                                props: {
                                    condition: 'state.currentStep === 3',
                                    conditionType: 'expression'
                                },
                                children: [
                                    {
                                        id: 'preferences-fields',
                                        type: 'container',
                                        component: 'fieldset',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        children: [
                                            {
                                                id: 'interests',
                                                type: 'dynamic-list',
                                                component: 'checkbox-group',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    label: 'Interests',
                                                    items: [
                                                        { value: 'technology', label: 'Technology' },
                                                        { value: 'design', label: 'Design' },
                                                        { value: 'business', label: 'Business' },
                                                        { value: 'marketing', label: 'Marketing' }
                                                    ]
                                                }
                                            },
                                            {
                                                id: 'notifications',
                                                type: 'component',
                                                component: 'checkbox',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    label: 'Receive email notifications',
                                                    defaultChecked: true
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'form-actions',
                        type: 'container',
                        component: 'footer',
                        category: 'layout',
                        subcategory: 'semantic',
                        children: [
                            {
                                id: 'form-buttons',
                                type: 'container',
                                component: 'flex-row',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'flex justify-between'
                                },
                                children: [
                                    {
                                        id: 'prev-button',
                                        type: 'conditional',
                                        component: 'button',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        props: {
                                            condition: 'state.currentStep > 1',
                                            conditionType: 'expression',
                                            trueContent: '<button type="button" class="btn btn-secondary">Previous</button>'
                                        }
                                    },
                                    {
                                        id: 'next-button',
                                        type: 'conditional',
                                        component: 'button',
                                        category: 'ui',
                                        subcategory: 'forms',
                                        props: {
                                            condition: 'state.currentStep < 3',
                                            conditionType: 'expression',
                                            trueContent: '<button type="button" class="btn btn-primary">Next</button>',
                                            falseContent: '<button type="submit" class="btn btn-success">Submit</button>'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Create Landing Page Template
     */
    createLandingPageTemplate() {
        return {
            root: {
                id: 'landing-root',
                type: 'smart-container',
                component: 'landing-page',
                category: 'layout',
                subcategory: 'smart',
                props: {
                    adaptiveLayout: true,
                    layoutStrategy: 'landing'
                },
                children: [
                    // Hero Section
                    {
                        id: 'hero-section',
                        type: 'container',
                        component: 'section',
                        category: 'layout',
                        subcategory: 'containers',
                        props: {
                            className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        },
                        children: [
                            {
                                id: 'hero-content',
                                type: 'container',
                                component: 'container',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'max-w-7xl mx-auto px-4 py-24 text-center'
                                },
                                children: [
                                    {
                                        id: 'hero-title',
                                        type: 'component',
                                        component: 'heading',
                                        category: 'ui',
                                        subcategory: 'typography',
                                        props: {
                                            level: 1,
                                            text: 'Build Amazing Websites with Our Components',
                                            className: 'text-5xl font-bold mb-6'
                                        }
                                    },
                                    {
                                        id: 'hero-subtitle',
                                        type: 'component',
                                        component: 'paragraph',
                                        category: 'ui',
                                        subcategory: 'typography',
                                        props: {
                                            text: 'Create stunning, responsive websites with our advanced component system.',
                                            className: 'text-xl mb-8'
                                        }
                                    },
                                    {
                                        id: 'hero-cta',
                                        type: 'container',
                                        component: 'flex-row',
                                        category: 'layout',
                                        subcategory: 'containers',
                                        props: {
                                            className: 'flex justify-center space-x-4'
                                        },
                                        children: [
                                            {
                                                id: 'primary-cta',
                                                type: 'component',
                                                component: 'button',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    text: 'Get Started',
                                                    className: 'bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100'
                                                }
                                            },
                                            {
                                                id: 'secondary-cta',
                                                type: 'component',
                                                component: 'button',
                                                category: 'ui',
                                                subcategory: 'forms',
                                                props: {
                                                    text: 'Learn More',
                                                    className: 'border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600'
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // Features Section
                    {
                        id: 'features-section',
                        type: 'container',
                        component: 'section',
                        category: 'layout',
                        subcategory: 'containers',
                        props: {
                            className: 'py-20'
                        },
                        children: [
                            {
                                id: 'features-content',
                                type: 'container',
                                component: 'container',
                                category: 'layout',
                                subcategory: 'containers',
                                props: {
                                    className: 'max-w-7xl mx-auto px-4'
                                },
                                children: [
                                    {
                                        id: 'features-title',
                                        type: 'component',
                                        component: 'heading',
                                        category: 'ui',
                                        subcategory: 'typography',
                                        props: {
                                            level: 2,
                                            text: 'Why Choose Our Components?',
                                            className: 'text-3xl font-bold text-center mb-12'
                                        }
                                    },
                                    {
                                        id: 'features-grid',
                                        type: 'dynamic-list',
                                        component: 'features-grid',
                                        category: 'ui',
                                        subcategory: 'content',
                                        props: {
                                            items: [
                                                {
                                                    icon: 'lightning',
                                                    title: 'Fast Performance',
                                                    description: 'Optimized for speed and performance'
                                                },
                                                {
                                                    icon: 'responsive',
                                                    title: 'Fully Responsive',
                                                    description: 'Works perfectly on all devices'
                                                },
                                                {
                                                    icon: 'customizable',
                                                    title: 'Highly Customizable',
                                                    description: 'Easily customize to match your brand'
                                                },
                                                {
                                                    icon: 'support',
                                                    title: '24/7 Support',
                                                    description: 'Get help whenever you need it'
                                                }
                                            ],
                                            itemTemplate: 'feature-card'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * Create remaining template methods (simplified for brevity)
     */
    createAdminPanelTemplate() {
        return {
            root: {
                id: 'admin-root',
                type: 'smart-container',
                component: 'admin-panel',
                category: 'layout',
                subcategory: 'smart',
                children: [
                    {
                        id: 'admin-sidebar',
                        type: 'container',
                        component: 'sidebar',
                        category: 'layout',
                        subcategory: 'navigation'
                    },
                    {
                        id: 'admin-main',
                        type: 'container',
                        component: 'main',
                        category: 'layout',
                        subcategory: 'semantic',
                        children: [
                            {
                                id: 'admin-dashboard',
                                type: 'dynamic-list',
                                component: 'dashboard-widgets',
                                category: 'ui',
                                subcategory: 'dashboard'
                            }
                        ]
                    }
                ]
            }
        };
    }

    createCreativePortfolioTemplate() {
        return {
            root: {
                id: 'portfolio-root',
                type: 'smart-container',
                component: 'portfolio',
                category: 'layout',
                subcategory: 'smart',
                children: [
                    {
                        id: 'portfolio-header',
                        type: 'container',
                        component: 'header',
                        category: 'layout',
                        subcategory: 'semantic'
                    },
                    {
                        id: 'portfolio-gallery',
                        type: 'dynamic-list',
                        component: 'project-gallery',
                        category: 'ui',
                        subcategory: 'media'
                    }
                ]
            }
        };
    }

    /**
     * Load template into orchestrator
     */
    async loadTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template || !this.orchestrator) {
            throw new Error(`Template not found or orchestrator not available: ${templateId}`);
        }

        try {
            // Clear existing components
            await this.orchestrator.shutdown();
            await this.orchestrator.initialize();

            // Load template structure recursively
            const rootComponent = await this.createComponentFromTemplate(template.structure.root);
            
            return {
                success: true,
                template,
                rootComponent
            };

        } catch (error) {
            console.error('Failed to load template:', error);
            throw error;
        }
    }

    /**
     * Create component from template structure
     */
    async createComponentFromTemplate(componentData, parentId = null) {
        const componentInstance = await this.orchestrator.createComponent({
            ...componentData,
            parentId
        });

        // Create children recursively
        if (componentData.children && componentData.children.length > 0) {
            for (const childData of componentData.children) {
                await this.createComponentFromTemplate(childData, componentInstance.id);
            }
        }

        return componentInstance;
    }

    /**
     * Export template
     */
    exportTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        return {
            ...template,
            exported: Date.now()
        };
    }

    /**
     * Import template
     */
    importTemplate(templateData) {
        if (!templateData.id || !templateData.structure) {
            throw new Error('Invalid template data');
        }

        this.registerTemplate(templateData.id, templateData);
        return templateData;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DemoTemplateManager = DemoTemplateManager;
}

export default DemoTemplateManager;