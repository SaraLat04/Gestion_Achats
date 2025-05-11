import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const Fournisseurs = () => {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedFournisseur, setSelectedFournisseur] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: '',
        code_postal: '',
        site_web: '',
        notes: '',
        statut: 'actif'
    });

    useEffect(() => {
        fetchFournisseurs();
    }, []);

    const fetchFournisseurs = async () => {
        try {
            const response = await axios.get('/api/fournisseurs');
            setFournisseurs(response.data);
        } catch (error) {
            toast.error('Erreur lors de la récupération des fournisseurs');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedFournisseur) {
                await axios.put(`/api/fournisseurs/${selectedFournisseur.id}`, formData);
                toast.success('Fournisseur mis à jour avec succès');
            } else {
                await axios.post('/api/fournisseurs', formData);
                toast.success('Fournisseur créé avec succès');
            }
            setShowModal(false);
            fetchFournisseurs();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement du fournisseur');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            try {
                await axios.delete(`/api/fournisseurs/${id}`);
                toast.success('Fournisseur supprimé avec succès');
                fetchFournisseurs();
            } catch (error) {
                toast.error('Erreur lors de la suppression du fournisseur');
            }
        }
    };

    const handleEdit = (fournisseur) => {
        setSelectedFournisseur(fournisseur);
        setFormData({
            nom: fournisseur.nom,
            email: fournisseur.email,
            telephone: fournisseur.telephone,
            adresse: fournisseur.adresse,
            ville: fournisseur.ville,
            pays: fournisseur.pays,
            code_postal: fournisseur.code_postal,
            site_web: fournisseur.site_web,
            notes: fournisseur.notes,
            statut: fournisseur.statut
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
                    <h2>Gestion des Fournisseurs</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="primary" onClick={() => {
                        setSelectedFournisseur(null);
                        setFormData({
                            nom: '',
                            email: '',
                            telephone: '',
                            adresse: '',
                            ville: '',
                            pays: '',
                            code_postal: '',
                            site_web: '',
                            notes: '',
                            statut: 'actif'
                        });
                        setShowModal(true);
                    }}>
                        Ajouter un Fournisseur
                    </Button>
                </Col>
            </Row>

            <Card>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Ville</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fournisseurs.map(fournisseur => (
                                <tr key={fournisseur.id}>
                                    <td>{fournisseur.nom}</td>
                                    <td>{fournisseur.email}</td>
                                    <td>{fournisseur.telephone}</td>
                                    <td>{fournisseur.ville}</td>
                                    <td>
                                        <span className={`badge bg-${fournisseur.statut === 'actif' ? 'success' : 'danger'}`}>
                                            {fournisseur.statut}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(fournisseur)}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(fournisseur.id)}
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

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {selectedFournisseur ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
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
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Téléphone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Site Web</Form.Label>
                                    <Form.Control
                                        type="url"
                                        name="site_web"
                                        value={formData.site_web}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control
                                type="text"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ville</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pays</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="pays"
                                        value={formData.pays}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Code Postal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="code_postal"
                                        value={formData.code_postal}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Statut</Form.Label>
                            <Form.Select
                                name="statut"
                                value={formData.statut}
                                onChange={handleChange}
                                required
                            >
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="text-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                Annuler
                            </Button>
                            <Button variant="primary" type="submit">
                                {selectedFournisseur ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Fournisseurs; 