import { useState, useMemo } from 'react';

// ** Icon Imports
import Icon from 'src/@core/components/icon';

// ** MUI imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { createTheme, ThemeProvider, useTheme } from '@mui/material';

// ** Query
import { useQuery, useMutation, useIsFetching, useIsMutating } from "@tanstack/react-query";

// ** Material react table
import MaterialReactTable, { type MRT_ColumnDef } from 'material-react-table';

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header';
import SubmitRemove from './submit-remove';
import ActionStructure from './action-structure';
import useStructure from 'src/hooks/useStructure';
import actionStructure from './actionStructure';
import deleteStructure from './deleteStructure';

// ** Types
import { TreeStructureRow } from 'src/types/structure-types';

const Structure = () => {
  const [confirmRemoval, setConfirmRemoval] = useState<boolean>(false)
  const [actionStructureOpen, setActionStructureOpen] = useState<boolean>(false)
  const [removalRowId, setRemovalRowId] = useState<string>('')
  const [editableData, setEditableData] = useState<any>(null)
  const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const [error, setError] = useState<string | boolean | Error>(false)

  const isMutating = useIsMutating()
  const isFetching = useIsFetching();

  const structureQuery = useQuery({
    queryKey: ['structure'], 
    queryFn: useStructure,
    initialData: [],
    onError: (error: Error) => setError(error)
  });

  const mutationAction = useMutation({
    mutationKey: ['structure'],
    mutationFn: actionStructure,
    onSuccess: () => structureQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  const mutationDelete = useMutation({
    mutationKey: ['structure'],
    mutationFn: deleteStructure,
    onSuccess: () => structureQuery.refetch(),
    onError: (error: Error) => setError(error)
  })

  const toggleConfirmRemovalDialog = (id: string) => { 
    setRemovalRowId(id)
    setConfirmRemoval(confirmRemoval => !confirmRemoval) 
  }

  const toggleActionStructureDialog = (row: any = null) => {
    setEditableData(row);
    setActionStructureOpen(!actionStructureOpen);
  }

  
  // ** re-define new theme to make some styles working as expected (bug of table tree-view styles displaying)
  const tableTheme = useMemo(
    () => createTheme({
        palette: {
          mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme
          primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table
        },
        typography: {
          button: {
            textTransform: 'none', //customize typography styles for all buttons in table by default
            fontSize: '1.2rem',
          }
        }
      }),
    [globalTheme]
  );

  // ** should be memoized or stable
  const colsStructure = useMemo<MRT_ColumnDef<TreeStructureRow>[]>(
    () => [
      {
        accessorKey: 'name', //access nested data with dot notation
        header: 'Отдел',
        size: 600, //large column
      },
      {
        id: 'delete',
        header: 'Действия', 
        Cell: ({ cell }) => {
          if (cell.row.original.custom != 0 && !cell.row.original.subRows) {
            return (
              <>
                <Tooltip title="Удалить" placement="bottom" >
                  <Button 
                    onClick={() => toggleConfirmRemovalDialog(cell.row.original.id)}
                    sx={{ px: 2, mr: 2 }}>
                      <Icon icon='mdi:delete' />
                  </Button>
                </Tooltip>
                <Tooltip title="Редактировать" placement="bottom" >
                  <Button 
                    onClick={() => toggleActionStructureDialog(cell.row.original)}
                    sx={{ px: 2, mr: 2 }}>
                      <Icon icon='mdi:edit' />
                  </Button>
                </Tooltip>
              </>
            )
          }
        },
      }
    ],
    [confirmRemoval, removalRowId]
  );
  
  return (
    <Box>
      <PageHeader
        title={<Typography variant="h4">Структура компании</Typography>}
        subtitle={<Typography variant='body2'>Структура компании</Typography>}
      />
      {error ? (
        <Alert severity='error'>{ error instanceof Error ? error.message : error }</Alert>
      ):null}
      <Card sx={{ mt: 4}}>
        <Box sx={{ m: 2 }}>
          <Button 
            variant='contained' 
            color='primary'
            onClick={() => { toggleActionStructureDialog() }}
            >
              <Icon icon='mdi:add' />
              Добавить новую структуру
          </Button>
        </Box>
        <ThemeProvider theme={tableTheme}>
          <MaterialReactTable 
            enableExpanding
            enablePagination={false}
            state={{ 
              isLoading: !!isFetching || isMutating > 0
            }}
            columns={colsStructure} 
            data={structureQuery?.data || []}
          />
        </ThemeProvider>
      </Card>

      <ActionStructure
        open={actionStructureOpen}
        handleClose={toggleActionStructureDialog}
        structure={structureQuery.data}
        handleActionStructure={mutationAction.mutate}
        editableData={editableData}
      />

      <SubmitRemove 
        open={confirmRemoval} 
        handleClose={toggleConfirmRemovalDialog} 
        handleRemove={() => mutationDelete.mutate(removalRowId)}
      />
    </Box>
  )
}

export default Structure;