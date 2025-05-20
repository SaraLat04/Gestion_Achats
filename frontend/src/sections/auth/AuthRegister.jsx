import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import auth from '../../api/auth';
import {
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  FormHelperText,
  Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AuthRegister() {
  const [roles, setRoles] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/roles')
      .then((response) => setRoles(response.data))
      .catch((error) => console.error('Erreur lors du chargement des rôles:', error));
  }, []);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/departements')
      .then((response) => setDepartements(response.data))
      .catch((error) => console.error('Erreur lors du chargement des départements:', error));
  }, []);

  const validationSchema = Yup.object({
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    role: Yup.string().required('Role is required'),
    company: Yup.string().required('Company is required')
  });

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      company: '',
      password: '',
      confirmPassword: '',
      role: '',
      photo: null
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('nom', values.firstname);
        formData.append('prenom', values.lastname);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('role', values.role);
        formData.append('departement', values.company);
        if (values.photo) {
          formData.append('photo', values.photo);
        }

        await auth.register(formData);

        alert('Utilisateur créé avec succès');
        navigate('/login');
      } catch (error) {
        alert('Erreur lors de la création de l\'utilisateur');
        console.error(error);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.firstname && Boolean(formik.errors.firstname)}>
            <InputLabel htmlFor="firstname">First Name*</InputLabel>
            <OutlinedInput
              id="firstname"
              name="firstname"
              value={formik.values.firstname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="First Name"
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <FormHelperText>{formik.errors.firstname}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.lastname && Boolean(formik.errors.lastname)}>
            <InputLabel htmlFor="lastname">Last Name*</InputLabel>
            <OutlinedInput
              id="lastname"
              name="lastname"
              value={formik.values.lastname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Last Name"
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <FormHelperText>{formik.errors.lastname}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.email && Boolean(formik.errors.email)}>
            <InputLabel htmlFor="email">Email*</InputLabel>
            <OutlinedInput
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Email"
            />
            {formik.touched.email && formik.errors.email && (
              <FormHelperText>{formik.errors.email}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)}>
            <InputLabel htmlFor="password">Password*</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Password"
            />
            {formik.touched.password && formik.errors.password && (
              <FormHelperText>{formik.errors.password}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}>
            <InputLabel htmlFor="confirmPassword">Confirm Password*</InputLabel>
            <OutlinedInput
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Confirm Password"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <FormHelperText>{formik.errors.confirmPassword}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
            <InputLabel htmlFor="role-signup">Role*</InputLabel>
            <Select
              label="Role"
              id="role-signup"
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {roles.length > 0 ? (
                roles.map((role, index) => (
                  <MenuItem key={index} value={role}>
                    {role}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun rôle disponible</MenuItem>
              )}
            </Select>
            {formik.touched.role && formik.errors.role && (
              <FormHelperText>{formik.errors.role}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.company && Boolean(formik.errors.company)}>
            <InputLabel id="departement-label">Département*</InputLabel>
            <Select
              labelId="departement-label"
              id="company"
              name="company"
              value={formik.values.company}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              input={<OutlinedInput label="Département" />}
            >
              {departements.length > 0 ? (
                departements.map((dept, index) => (
                  <MenuItem key={index} value={dept}>
                    {dept}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun département disponible</MenuItem>
              )}
            </Select>
            {formik.touched.company && formik.errors.company && (
              <FormHelperText>{formik.errors.company}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={(event) => {
                formik.setFieldValue("photo", event.currentTarget.files[0]);
              }}
            />
            {formik.errors.photo && <FormHelperText error>{formik.errors.photo}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button fullWidth size="large" variant="contained" color="primary" type="submit">
            S'inscrire
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
