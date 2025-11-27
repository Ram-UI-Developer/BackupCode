import React from 'react'
import OrgChart from '@dabeng/react-orgchart'
import PageHeader from '../../../Common/CommonComponents/PageHeader'
import Loader from '../../../Common/CommonComponents/Loader'
// import "@dabeng/react-orgchart/lib/react-orgchart.css";

const OrganizationChart = () => {
    // const myApp = 'http://localhost:3000/'
    const loading = false;
    const orgData = {
        id: '1',
        name: 'CEO',
        title: 'Company Head',
        image: '/dist/SVGs/Locations.svg',
        children: [
            {
                id: '2',
                name: 'Bhaskar Pakki',
                title: 'Manager',
                image: '/dist/SVGs/Locations.svg',
                children: [
                    {
                        id: '3',
                        name: 'RamChandra',
                        title: 'Team Lead',
                        children: [
                            {
                                id: '1',
                                name: 'Venkatesh',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Locations.svg'
                            },
                            {
                                id: '2',
                                name: 'Sravani.K',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Locations.svg'
                            },
                            {
                                id: '3',
                                name: 'Narayana',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Locations.svg'
                            },
                            {
                                id: '4',
                                name: 'Akhil',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Locations.svg'
                            },
                            {
                                id: '5',
                                name: 'Padhmavathi',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            }
                        ],
                        image: '/dist/SVGs/Locations.svg'
                    },
                    {
                        id: '3',
                        name: 'Dileep',
                        title: 'Team Lead',
                        children: [
                            {
                                id: '1',
                                name: 'Chakri',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '4',
                                name: 'Indraja',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '2',
                                name: 'Pujitha',
                                title: 'Associative Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '3',
                                name: 'Avinash',
                                title: 'Associative Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '4',
                                name: 'Sreekar',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            }
                        ],
                        image: '/dist/SVGs/Locations.svg'
                    },
                    {
                        id: '3',
                        name: 'Soundarya',
                        title: 'Team Lead',
                        children: [
                            {
                                id: '1',
                                name: 'Sravika',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '2',
                                name: 'Laxman',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '3',
                                name: 'Priyank',
                                title: 'Ass.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            },
                            {
                                id: '4',
                                name: 'Lavanya',
                                title: 'Sr.Software Engineer',
                                image: '/dist/SVGs/Screens.svg'
                            }
                        ],
                        image: '/dist/SVGs/Locations.svg'
                    }
                ]
            },
            {
                id: '5',
                name: 'Krishna Kishore',
                title: 'Manager',
                image: '/dist/SVGs/Authorize.svg',
                children: [
                    {
                        id: '1',
                        name: 'Bhanu Prakash',
                        title: 'Ass.Software Engineer',
                        image: '/dist/SVGs/Screens.svg'
                    },
                    {
                        id: '2',
                        name: 'Keerthana',
                        title: 'Ass.Software Engineer',
                        image: '/dist/SVGs/Screens.svg'
                    },
                    {
                        id: '3',
                        name: 'Sravani',
                        title: 'Ass.Software Engineer',
                        image: '/dist/SVGs/Screens.svg'
                    },
                    {
                        id: '4',
                        name: 'Nagarjuna',
                        title: 'Ass.Software Engineer',
                        image: '/dist/SVGs/Screens.svg'
                    }
                ]
            }
        ]
    }

    const nodeTemplate = (nodeData) => {
        console.log(nodeData, 'nodeData')
        return (
            <div style={styles.node}>
                <img
                    src={nodeData.image || '/dist/SVGs/Reimburse.svg'}
                    alt={nodeData.name}
                    style={styles.image}
                />
                <h3 style={styles.name}>{nodeData.name}</h3>
                <p style={styles.title}>{nodeData.title}</p>
            </div>
        )
    }

    const styles = {
        node: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            backgroundColor: '#f4f4f4',
            width: '150px'
        },
        image: {
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            marginBottom: '10px'
        },
        name: {
            margin: '0',
            fontSize: '16px',
            fontWeight: 'bold'
        },
        title: {
            margin: '0',
            fontSize: '14px',
            color: '#666'
        }
    }

    return (
        <section className="section">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <br />
                        <PageHeader pageTitle=" " />
                        {
                            loading ? (
                                <center>
                                    <Loader />
                                </center>
                            ) : (
                                // <div className="payment-container">

                                <div>
                                    <OrgChart
                                        datasource={orgData}
                                        nodeTemplate={nodeTemplate}
                                        chartClass="org-chart"
                                        // collapsible
                                    />
                                </div>
                            )
                            // </div>
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OrganizationChart
