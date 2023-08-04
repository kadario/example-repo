import { useState } from 'react';

// ** MUI imports
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link'
import { DataGrid, GridRowsProp, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Query
import { useQuery, useMutation, useIsFetching, useIsMutating } from "@tanstack/react-query";

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Custom Components
import ActionContact from './action-contact';
import CustomQuickToolbar from 'src/views/table/CustomQuickToolbar'
import SubmitRemove from './submit-remove';

// ** Queries hooks
import useContacts from './useContacts';
import deleteContact from './deleteContact';
import actionContact from './actionContact';

// ** Types
import { ExistingContact } from 'src/types/service-contacts-types'

const ServicesContacts = () => {
  const [editableData, setEditableData] = useState<ExistingContact | null>(null)
  const [confirmRemoval, setConfirmRemoval] = useState<boolean>(false)
  const [removalRowId, setRemovalRowId] = useState<string>('')
  const [error, setError] = useState<Error | string | boolean>(false)

  const [actionContactOpen, setActionContactOpen] = useState<boolean>(false)

  const isMutating = useIsMutating()
  const isFetching = useIsFetching();

  // ** Set up queries
  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: useContacts,
    initialData: [],
    onError: (error: Error) => setError(error)
  });

  const mutationDelete = useMutation({
    mutationKey: ['contacts'],
    mutationFn: deleteContact,
    onSuccess: () => contactsQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  const mutationAction = useMutation({
    mutationKey: ['contacts'],
    mutationFn: actionContact,
    onSuccess: () => contactsQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  const toggleActionContactDialog = (contact = null) => {
    setEditableData(contact)
    setActionContactOpen(!actionContactOpen)
  }

  const toggleConfirmRemovalDialog = (id: string) => { 
    setRemovalRowId(id)
    setConfirmRemoval(confirmRemoval => !confirmRemoval) 
  }

  const columns: GridColDef[] = [
    { 
      field: 'image', 
      headerName: 'Фото', 
      flex: 1,
      renderCell: ({value}) => {
        if (value) {
          return <img src={value} width="42" />
        } else {
          return 'Отсутствует'
        }
      }
    },
    { field: 'name', headerName: 'Должность', flex: 1},
    { field: 'description', headerName: 'Описание', flex: 2},
    { field: 'phone', headerName: 'Телефон', flex: 1},
    { field: 'mobile_phone', headerName: 'Мобильный тел.', flex: 1},
    { field: 'email', headerName: 'Email', flex: 2},
    { 
      field: 'link', 
      headerName: 'Ссылка на заявку', 
      flex: 1,
      renderCell: ({value}) => (<Link href={value.url} target="_blank">{ value.name }</Link>)
    },
    {
      field: '',
      headerName: 'Действия',
      flex: 1.2,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="Редактировать" placement="bottom" >
            <Button 
              onClick={() => toggleActionContactDialog(params.row)}
              sx={{ px: 2 }}>
                <Icon icon='mdi:edit' />
            </Button>
          </Tooltip>
          <Tooltip title="Удалить" placement="bottom" >
            <Button 
              onClick={() => toggleConfirmRemovalDialog(params.row.id)}
              sx={{ px: 2, mr: 2 }}>
                <Icon icon='mdi:delete' />
            </Button>
          </Tooltip>
        </>
      )
    }
  ];
  
  return (
    <>
      <PageHeader
        title={<Typography variant="h4">Контакты служб</Typography>}
        subtitle={<Typography variant='body2'>Сервисы поддержки компании</Typography>}
      />
      
      { error ? (
        <Alert severity='error'>{ error instanceof Error ? error.message : error }</Alert>
      ):null}

      <Card sx={{ mt: 4 }}>
        <DataGrid 
          autoHeight
          getRowHeight={() => 'auto'}
          rows={contactsQuery.data || []} 
          loading={ isFetching || isMutating > 0 ? true : false  }
          columns={columns} 
          components={{
            Toolbar: (() => {
              return (
                <CustomQuickToolbar>
                  <Button 
                    variant='contained' 
                    color='primary'
                    onClick={() => toggleActionContactDialog()}
                    >
                      <Icon icon='mdi:add' />
                      Добавить новый контакт
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

      <ActionContact
        open={actionContactOpen} 
        editableData={editableData}
        handleClose={toggleActionContactDialog}
        handleSave={mutationAction.mutate}
      />

      <SubmitRemove 
        open={confirmRemoval} 
        handleClose={toggleConfirmRemovalDialog} 
        handleRemove={() => mutationDelete.mutate(removalRowId)}
      />
    </>
  )
}

export default ServicesContacts;