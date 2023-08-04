import { useEffect, useState } from 'react';

// ** MUI imports
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** Query
import { useQuery, useMutation, useIsFetching, useIsMutating } from "@tanstack/react-query";

// ** Queries hooks - get, update, delete
import useStructure from 'src/hooks/useStructure';
import usePositions from './usePositions';
import useEmployees from './useEmployees';
import deleteEmployee from './deleteEmployee';
import actionEmployee from './actionEmployee';

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header';
import SubmitRemove from './submit-remove';
import EmployeeAction from './employee-action';
import CustomQuickToolbar from 'src/views/table/CustomQuickToolbar';

// ** Types
import { RemovalEmployee } from 'src/types/employee-types';

const Employees = () => {
  // ** Using hooks
  const [confirmRemoval, setConfirmRemoval] = useState<boolean>(false)
  const [removalRowId, setRemovalRowId] = useState<string>('')
  const [actionEmployeeOpen, setActionEmployeeOpen] = useState<boolean>(false)
  const [editableData, setEditableData] = useState<any>(null)
  const [error, setError] = useState<boolean | Error>(false);

  const isMutating = useIsMutating()
  const isFetching = useIsFetching();

  // ** Set up queries
  const employeeQuery = useQuery({
    queryKey: ['employees'],
    queryFn: useEmployees,
    initialData: [],
    onError: (error: Error) => setError(error)
  });
  
  const structureQuery = useQuery({
    queryKey: ['structure'], 
    queryFn: useStructure,
    onError: (error: Error) => setError(error)
  });

  const positionsQuery = useQuery({
    queryKey: ['positions'], 
    queryFn: usePositions,
    onError: (error: Error) => setError(error)
  });

  const mutationDelete = useMutation({
    mutationKey: ['employees'],
    mutationFn: deleteEmployee,
    onSuccess: () => employeeQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  const mutationAction = useMutation({
    mutationKey: ['employees'],
    mutationFn: actionEmployee,
    onSuccess: () => employeeQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  // ** handling errors from queries - showing or hiding them
  useEffect(() => {
    if (isFetching || isMutating > 0 && error) setError(false);
  }, [isFetching, isMutating])

  // ** Fires save/edit employee data
  const toggleActionEmployeeDialog = (row = null) => {
    setEditableData(row);
    setActionEmployeeOpen(!actionEmployeeOpen)
  }

  // ** Fires removing data
  const toggleConfirmRemovalDialog = (userData: RemovalEmployee) => {
    setConfirmRemoval(!confirmRemoval)
    setRemovalRowId(userData?.id)
  }

  const columns: GridColDef[] = [
    { 
      field: 'thumbnailphoto', 
      headerName: 'Изображение', 
      flex: 1,
      renderCell: ({row, value}) => <Avatar sx={{ width: 50, height: 50}} alt={row.name} src={value}  />
    },
    { field: 'name', headerName: 'Имя', flex: 2},
    { field: 'mobile', headerName: 'Телефон', flex: 1},
    { field: 'mobile_personal', headerName: 'Мобильный телефон', flex: 1},
    { field: 'email', headerName: 'Имэйл', flex: 1},
    { field: 'title', headerName: 'Должность', flex: 1},
    {
      field: '',
      headerName: 'Действия', 
      flex: 1,
      renderCell: ({row}) => {
        return (
          <>
            <Tooltip title="Удалить" placement="bottom" >
              <Button 
                onClick={() => toggleConfirmRemovalDialog(row)}
                sx={{ px: 2, mr: 2 }}>
                  <Icon icon='mdi:delete' />
              </Button>
            </Tooltip>
            <Tooltip title="Редактировать" placement="bottom" >
              <Button 
                onClick={() => toggleActionEmployeeDialog(row)}
                sx={{ px: 2, mr: 2 }}>
                  <Icon icon='mdi:edit' />
              </Button>
            </Tooltip>
          </>
        )
      }
    }
  ];

  return (
    <>
      <PageHeader
        title={<Typography variant="h4">Сотрудники</Typography>}
        subtitle={<Typography variant='body2'>Сотрудники компании</Typography>}
      />

      { error ? (
        <Alert severity='error'>{ error instanceof Error ? error.message : error }</Alert>
      ):null}

      <Card sx={{ mt: 4 }}>
        <DataGrid 
          autoHeight
          getRowHeight={() => 'auto'}
          getRowId={(row) => row.id}
          rows={employeeQuery.data || []}
          loading={ isFetching || isMutating > 0 ? true : false  }
          columns={columns} 
          components={{
            Toolbar: (() => {
              return (
                <CustomQuickToolbar>
                  <Button 
                    variant='contained' 
                    color='primary'
                    onClick={() => { toggleActionEmployeeDialog() }}
                    >
                      <Icon icon='mdi:add' />
                      Добавить нового пользвателя
                  </Button>
                </CustomQuickToolbar>
              )
            }),
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            }
          }}
        />
      </Card>
      
      {/* Add/Edit employee dialog */}
      <EmployeeAction
        open={actionEmployeeOpen}
        handleClose={toggleActionEmployeeDialog}
        handleActionEmployee={mutationAction.mutate}
        editableData={editableData}
        structure={structureQuery.data}
        positions={positionsQuery.data}
      />

      {/* Removing dialog */}
      <SubmitRemove 
        open={confirmRemoval} 
        handleClose={toggleConfirmRemovalDialog} 
        handleRemove={() => mutationDelete.mutate(removalRowId)}
      />
    </>
  )
}

export default Employees;
