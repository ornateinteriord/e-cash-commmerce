import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, InputAdornment, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PaymentsIcon from '@mui/icons-material/Payments';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PercentIcon from '@mui/icons-material/Percent';
import PersonIcon from '@mui/icons-material/Person';
import DataTable from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import { useCreatePackageMutation, useGetPackages, useAssignPackageMutation } from '../../../api/Packages';

const AddOnPackageView = () => {
  const { data: packages, isLoading } = useGetPackages();
  const { mutate: createPackage, isPending } = useCreatePackageMutation();
  const { mutate: assignPackage, isPending: isAssigning } = useAssignPackageMutation();

  const [assignData, setAssignData] = useState({
    member_id: '',
    package_id: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    days_count: '',
    daily_percent: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssignData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignData.member_id || !assignData.package_id) return;

    // Get cost dynamically for audit/payment record
    const selectedPkg = packages?.find((p: any) => p.package_id === assignData.package_id);

    assignPackage({
      member_id: assignData.member_id,
      package_id: assignData.package_id,
      amount_paid: selectedPkg ? selectedPkg.cost : 0
    }, {
      onSuccess: () => {
        setAssignData({ member_id: '', package_id: '' });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cost || !formData.days_count || !formData.daily_percent) return;

    createPackage({
      name: formData.name,
      cost: Number(formData.cost),
      days_count: Number(formData.days_count),
      daily_percent: Number(formData.daily_percent)
    }, {
      onSuccess: () => {
        setFormData({ name: '', cost: '', days_count: '', daily_percent: '' });
      }
    });
  };

  const columns = [
    { name: 'Package ID', selector: (row: any) => row.package_id, sortable: true },
    { name: 'Name', selector: (row: any) => row.name, sortable: true },
    { name: 'Cost', selector: (row: any) => row.cost, sortable: true },
    { name: 'Days Count', selector: (row: any) => row.days_count, sortable: true },
    { name: 'Daily %', selector: (row: any) => `${row.daily_percent}%`, sortable: true },
    { name: 'Status', selector: (row: any) => row.status ? "Active" : "Inactive" }
  ];

  return (
    <>
      <Typography variant="h4" sx={{ mx: '2rem', mb: '2rem', mt: '100px' }}>
        Manage Add-On Packages
      </Typography>

      {/* CREATE PACKAGE FORM */}
      <Card sx={{ margin: '2rem', mt: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>Create New Add-On Package</div>
          <div style={{ padding: "0 1rem 1rem 1rem" }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Package Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LocalOfferIcon /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PaymentsIcon /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Payout Days Count"
                      name="days_count"
                      value={formData.days_count}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><DateRangeIcon /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Daily Percent"
                      name="daily_percent"
                      value={formData.daily_percent}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PercentIcon /></InputAdornment> }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isPending}
                  sx={{ mt: 3, backgroundColor: '#0a2558', '&:hover': { backgroundColor: '#581c87' } }}
                >
                  {isPending ? 'Generating...' : 'Generate Add-On'}
                </Button>
              </form>
            </div>
        </CardContent>
      </Card>

      {/* DIRECT PACKAGE ASSIGNMENT */}
      <Card sx={{ margin: '2rem', mt: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>Assign Add-On Package to Vendor</div>
          <div style={{ padding: "0 1rem 1rem 1rem" }}>
            <form onSubmit={handleAssignSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="assign-package-label">Select Package</InputLabel>
                      <Select
                        labelId="assign-package-label"
                        name="package_id"
                        value={assignData.package_id}
                        onChange={(e) => setAssignData(prev => ({ ...prev, package_id: e.target.value as string }))}
                        label="Select Package"
                        startAdornment={<InputAdornment position="start"><LocalOfferIcon sx={{ mr: 1, color: "rgba(0, 0, 0, 0.54)" }} /></InputAdornment>}
                      >
                        <MenuItem value="" disabled>Select an Add-On</MenuItem>
                        {packages?.map((pkg: any) => (
                          <MenuItem key={pkg.package_id} value={pkg.package_id}>
                            {pkg.name} (${pkg.cost})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Vendor ID"
                      name="member_id"
                      value={assignData.member_id}
                      onChange={handleAssignChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isAssigning}
                  sx={{ mt: 3, backgroundColor: '#0a2558', '&:hover': { backgroundColor: '#581c87' } }}
                >
                  {isAssigning ? 'Assigning...' : 'Assign Package'}
                </Button>
              </form>
            </div>
        </CardContent>
      </Card>

      {/* PACKAGE LIST */}
      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>Available Add-On Packages</div>
          <div style={{ padding: "0 1rem 1rem 1rem" }}>
            <DataTable
                columns={columns}
                data={packages || []}
                pagination
                progressPending={isLoading}
                progressComponent={<CircularProgress />}
                customStyles={DASHBOARD_CUTSOM_STYLE}
              />
            </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AddOnPackageView;
