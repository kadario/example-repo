import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom components
import SelectChip from './SelectChip'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Store
import { useDispatch, useSelector } from 'react-redux'
import { dialogAction, editUserDataAction } from 'src/store/index'

const EditUserDialog = (props: any) => {
  const dispatcher = useDispatch()
  const dialogData = useSelector((state: any) => state.dialog)
  const editableUserData = useSelector((state: any) => state.edituserdata)
  const [roles, setRoles] = useState<Array<any>>([])
  const [updatedRoles, setUpdatedRoles] = useState<Array<any> | null>(null)
  const [permissions, setPermissions] = useState<Array<any>>([])
  const [updatedPermissions, setUpdatedPermissions] = useState<Array<any> | null>(null)
  const [cities, setCities] = useState<Array<any>>([])
  const [updatedCities, setUpdatedCities] = useState<Array<any> | null>(null)

  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [sessionEnded, setSessionEnded] = useState<boolean>(false)
  const [loaderSession, setLoaderSession] = useState<boolean>(false)
  const [loaderSave, setLoaderSave] = useState<boolean>(false)

  const { logout } = useAuth()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleUpdateCities = (citiesList: any) => setUpdatedCities(citiesList)
  const handleUpdateRoles = (rolesList: any) => setUpdatedRoles(rolesList)
  const handleUpdatePermissions = (permissionsList: any) => setUpdatedPermissions(permissionsList)

  const handleClose = () => {
    if (sessionEnded) setSessionEnded(false)
    dispatcher(dialogAction.dialogClose())
    dispatcher(editUserDataAction.removeEditableUserData())
  }

  const handleEndSession = () => {
    setLoaderSession(true)
    setConfirmOpen(false)

    axios
      .get(api.url + '/auth/logout/' + editableUserData?.id, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(() => {
        setSessionEnded(true)
        setLoaderSession(false)
      })
      .catch(error => {
        console.error(error)
        setLoaderSession(false)
        if (error.response.status == 401) {
          logout()
        }
      })
      .catch(error => console.error(error))
  }

  const handleSaveData = () => {
    // Get arrays of IDs from objects we manipulated with
    // @todo: refactor this function someday!
    const updatedRolesIDs = updatedRoles?.map((item: any) => item.id).sort()
    const rolesIDs = editableUserData.roles.map((item: any) => item.id).sort()
    const updatedPermissionsIDs = updatedPermissions?.map((item: any) => item.id).sort()
    const permissionIDs = editableUserData.permissions.map((item: any) => item.id).sort()
    const updatedCitiesIDs = updatedCities?.map((item: any) => item.id).sort()
    const citiesIDs = editableUserData.cities.map((item: any) => item.id).sort()

    const requests = []

    setLoaderSave(true)

    if (JSON.stringify(updatedRolesIDs) !== JSON.stringify(rolesIDs)) {
      if (updatedRolesIDs && updatedRolesIDs?.length >= rolesIDs.length) {
        requests.push(
          axios.put(
            `${api.url}/admin/user-possibilities/${editableUserData.id}/roles`,
            {
              permissions: updatedRoles
            },
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-type': 'application/json'
              }
            }
          )
        )
      } else {
        requests.push(
          axios.delete(`${api.url}/admin/user-possibilities/${editableUserData.id}/roles`, {
            data: {
              permissions: updatedRoles
            },
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          })
        )
      }
    }

    if (JSON.stringify(updatedPermissionsIDs) !== JSON.stringify(permissionIDs)) {
      if (updatedPermissionsIDs && updatedPermissionsIDs?.length >= permissionIDs.length) {
        requests.push(
          axios.put(
            `${api.url}/admin/user-possibilities/${editableUserData.id}/permissions`,
            {
              permissions: updatedPermissions
            },
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-type': 'application/json'
              }
            }
          )
        )
      } else {
        requests.push(
          axios.delete(`${api.url}/admin/user-possibilities/${editableUserData.id}/permissions`, {
            data: {
              permissions: updatedPermissions
            },
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          })
        )
      }
    }

    if (JSON.stringify(updatedCitiesIDs) !== JSON.stringify(citiesIDs)) {
      requests.push(
        axios.patch(
          `${api.url}/users/${editableUserData.id}`,
          {
            is_active: editableUserData.is_active,
            cities: updatedCitiesIDs
          },
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          }
        )
      )
    }

    axios
      .all(requests)
      .then(() => {
        setLoaderSave(false)
        props.loadTrigger(editableUserData?.id)
        dispatcher(dialogAction.dialogClose())
      })
      .catch(error => {
        console.error(error)
        props.loadTrigger(editableUserData?.id)
        setLoaderSave(false)
        dispatcher(dialogAction.dialogClose())

        if (error.response.status == 401) {
          logout()
        }
      })
  }

  useEffect(() => {
    axios
      .get(api.url + '/admin/roles/', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        setRoles(response.data.data)
      })
      .catch(error => {
        console.error(error)

        if (error.response.status == 401) {
          logout()
        }
      })

    axios
      .get(api.url + '/admin/permissions/', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        setPermissions(response.data.data)
      })
      .catch(error => {
        console.error(error)

        if (error.response.status == 401) {
          logout()
        }
      })

    axios
      .get(api.url + '/proxy/references/cities/', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        setCities(response.data.data)
      })
      .catch(error => {
        console.error(error)

        if (error.response.status == 401) {
          logout()
        }
      })
  }, [logout, storedToken])

  return (
    <Dialog open={dialogData.open}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant='h6' component='span' sx={{ flex: 1 }}>
          {editableUserData.full_name}
        </Typography>
        <IconButton aria-label='close' onClick={handleClose} sx={{ alignSelf: 'right' }}>
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:user' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Логин:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{editableUserData.name}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:email' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Имэйл:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>{editableUserData.email}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:check' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Статус:</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {editableUserData.is_active ? 'Активный' : 'Неактивный'}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:check' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Роль:</Typography>
          <Box sx={{ color: 'text.secondary' }}>
            <SelectChip
              valuesList={roles}
              selectedValuesList={editableUserData.roles}
              updateSelectedValues={handleUpdateRoles}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:check' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Доступы:</Typography>
          <Box sx={{ color: 'text.secondary' }}>
            <SelectChip
              valuesList={permissions}
              selectedValuesList={editableUserData.permissions}
              updateSelectedValues={handleUpdatePermissions}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Icon icon='mdi:check' />
          <Typography sx={{ mx: 2, fontWeight: 600, color: 'text.secondary' }}>Города:</Typography>
          <Box sx={{ color: 'text.secondary' }}>
            <SelectChip
              valuesList={cities}
              selectedValuesList={editableUserData.cities}
              updateSelectedValues={handleUpdateCities}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {sessionEnded ? (
            <Alert severity='success'>Сессия пользователя {editableUserData.full_name} завершена</Alert>
          ) : null}

          <Button
            disabled={loaderSession}
            variant='outlined'
            color='warning'
            onClick={() => setConfirmOpen(true)}
            sx={{ mt: 3.5 }}
          >
            Завершить сессию
            {loaderSession ? <CircularProgress sx={{ ml: 4 }} size='1rem' /> : <></>}
          </Button>
          <Dialog open={confirmOpen}>
            <DialogTitle>Завершение сессии</DialogTitle>
            <DialogContent>
              Вы действительно хотите завершить сессию пользователя {editableUserData.full_name}?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Нет</Button>
              <Button onClick={handleEndSession}>Да</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ pt: 4 }}>
          {loaderSave ? <CircularProgress sx={{ ml: 4 }} size='1rem' /> : null}
          <Button onClick={handleClose} sx={{ mr: 2 }}>
            Закрыть
          </Button>
          <Button onClick={handleSaveData} variant='contained' disabled={loaderSave}>
            Сохранить
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default EditUserDialog
