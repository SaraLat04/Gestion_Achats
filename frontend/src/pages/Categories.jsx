import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategorie, setSelectedCategorie] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        code: '',
        categorie_parent_id: null
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            toast.error('Erreur lors de la récupération des catégories');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCategorie) {
                await axios.put(`/api/categories/${selectedCategorie.id}`, formData);
                toast.success('Catégorie mise à jour avec succès');
            } else {
                await axios.post('/api/categories', formData);
                toast.success('Catégorie créée avec succès');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement de la catégorie');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            try {
                await axios.delete(`/api/categories/${id}`);
                toast.success('Catégorie supprimée avec succès');
                fetchCategories();
            } catch (error) {
                toast.error('Erreur lors de la suppression de la catégorie');
            }
        }
    };

    const handleEdit = (categorie) => {
        setSelectedCategorie(categorie);
        setFormData({
            nom: categorie.nom,
            description: categorie.description,
            code: categorie.code,
            categorie_parent_id: categorie.categorie_parent_id
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <h2>Gestion des Catégories</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => {
                        setSelectedCategorie(null);
                        setFormData({
                            nom: '',
                            description: '',
                            code: '',
                            categorie_parent_id: null
                        });
                        setShowModal(true);
                    }}>
                        Ajouter une Catégorie
                    </Button>
                </Col>
            </Row>

            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Nom</th>
                                <th>Description</th>
                                <th>Catégorie Parent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(categorie => (
                                <tr key={categorie.id}>
                                    <td>{categorie.code}</td>
                                    <td>{categorie.nom}</td>
                                    <td>{categorie.description}</td>
                                    <td>{categorie.parent?.nom || '-'}</td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(categorie)}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(categorie.id)}
                                        >
                                            Supprimer
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedCategorie ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Catégorie Parent</Form.Label>
                            <Form.Select
                                name="categorie_parent_id"
                                value={formData.categorie_parent_id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Aucune (catégorie principale)</option>
                                {categories
                                    .filter(c => c.id !== selectedCategorie?.id)
                                    .map(categorie => (
                                        <option key={categorie.id} value={categorie.id}>
                                            {categorie.nom}
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="text-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit">
                                {selectedCategorie ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Categories; 