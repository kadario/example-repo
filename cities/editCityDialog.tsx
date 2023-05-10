import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** React hook form
import { useForm, Controller } from 'react-hook-form'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

const EditCityDialog = ({ cityRowData, dialogOpen, handleEditDialogClose, loadTrigger }: any) => {
  const [isActive, setIsActive] = useState<string>('')
  const [saveDisabled, setSaveDisabled] = useState<boolean>(true)
  const [cityName, setCityName] = useState<string>('')
  const [loaderSave, setLoaderSave] = useState<boolean>(false)
  const { logout } = useAuth()

  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<any>()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleClose = () => {
    handleEditDialogClose(false)
    setSaveDisabled(true)
  }

  const handleActiveChange = (event: SelectChangeEvent) => {
    setIsActive(event.target.value)
    if (saveDisabled && cityName?.length > 3) setSaveDisabled(false)
  }

  const handleCityNameChange = (event: any) => {
    setCityName(event.target.value)
    if (saveDisabled && cityName?.length > 2) setSaveDisabled(false)
  }

  const handleCitySave = () => {
    setLoaderSave(true)
    const deleted = isActive && isActive === 'deleted' ? true : false

    if (cityRowData?.name && cityRowData?.id) {
      axios
        .patch(
          `${api.url}/proxy/references/cities/${cityRowData.id}`,
          {
            name: cityName,
            deleted: deleted
          },
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          }
        )
        .then(() => {
          handleClose()
          setLoaderSave(false)
          loadTrigger(cityRowData.id)
        })
        .catch(error => {
          console.error(error)
          handleClose()
          setLoaderSave(false)
          loadTrigger(cityRowData.id)

          if (error.response.status == 401) {
            logout()
          }
        })
    } else {
      axios
        .post(
          `${api.url}/proxy/references/cities/`,
          {
            name: cityName,
            deleted: deleted
          },
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          }
        )
        .then(() => {
          handleClose()
          setLoaderSave(false)
          loadTrigger(0)
        })
        .catch(error => {
          console.error(error)
          handleClose()
          setLoaderSave(false)
          loadTrigger(0)

          if (error.response.status == 401) {
            logout()
          }
        })
    }
  }

  useEffect(() => {
    setIsActive(cityRowData?.deleted ? 'deleted' : 'not_deleted')
    setCityName(cityRowData?.name)
  }, [cityRowData])


  return (
    <Dialog open={dialogOpen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant='h6' component='span' sx={{ flex: 1 }}>
          {cityRowData?.name ? <>Редактировать город {cityRowData?.name}</> : <>Добавить город</>}
        </Typography>
        <IconButton aria-label='close' onClick={handleClose} sx={{ alignSelf: 'right' }}>
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleCitySave)}>
        <DialogContent dividers sx={{ p: 4 }}>
          <FormControl fullWidth>
            <Controller
              name='cityName'
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange } }) => (
                <TextField
                  id='city-name'
                  defaultValue={cityRowData?.name}
                  error={Boolean(errors.cityName)}
                  label='Город'
                  variant='outlined'
                  sx={{ mb: 4 }}
                  onChange={event => {
                    onChange(event)
                    handleCityNameChange(event)
                  }}
                />
              )}
            />
            {errors.cityName && (
              <FormHelperText sx={{ color: 'error.main', mb: 6, ml: 0 }} id='validation-basic-city-name'>
                Это поле обязательно для заполнения
              </FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id='label-city-is-active'>Активный</InputLabel>
            <Select
              labelId='label-city-is-active'
              id='city-is-active'
              value={isActive}
              label='Активный'
              onChange={handleActiveChange}
            >
              {/*
              True - is deleted and NOT active
              False - is not deleted and active
            */}
              <MenuItem value={'not_deleted'}>Активен</MenuItem>
              <MenuItem value={'deleted'}>Не активен</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Box sx={{ pt: 4 }}>
            {loaderSave ? <CircularProgress sx={{ ml: 4 }} size='1rem' /> : null}
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Закрыть
            </Button>
            <Button type='submit' variant='contained' disabled={saveDisabled}>
              Сохранить
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditCityDialog
