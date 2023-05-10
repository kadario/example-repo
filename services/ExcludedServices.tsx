import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Imports
import Alert from '@mui/material/Alert'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { excludedItemAction } from 'src/store/index'

const ExcludedServices = () => {
  const [disabled, setDisabled] = useState<boolean>(false)
  const [error, setError] = useState<boolean | string>(false)
  const [loader, setLoader] = useState<boolean>(false)
  const [comment, setComment] = useState<string | null>(null)
  const [excludedChanged, setExcludedChanged] = useState<boolean>(false)
  const [excludedProhibitedChecked, setExcludedProhibitedChecked] = useState<boolean>(false)

  const serviceStoreData = useSelector((state: any) => state.serviceitem)
  const dispatcher = useDispatch()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)
  const { logout } = useAuth()

  const sentRequestExcluded = () => {
    setLoader(true)

    axios
      .patch(
        api.url + '/proxy/references/excluded-services/' + serviceStoreData.id,
        {
          prohibited: excludedProhibitedChecked,
          comment: comment
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-type': 'application/json'
          }
        }
      )
      .then(() => {
        dispatcher(excludedItemAction.triggerExcludedItem())
      })
      .catch(error => {
        if (error.response.status == 401) {
          logout()
        } else {
          console.error('excluded error', error)
          setError(error.response.data.message[0])
          setDisabled(false)
        }
      })
  }

  // Sent request by this click
  const handleClick = (event: any) => {
    event.preventDefault()
    if (comment != null && comment.length < 3) {
      setError('Минимальное количество символов - 3')
    } else {
      setDisabled(true)
      sentRequestExcluded()

      if (error) {
        setError(false)
      }
    }
  }

  useEffect(() => {
    if (serviceStoreData.excluded_service != null) {
      setComment(serviceStoreData.excluded_service.comment)
      setExcludedProhibitedChecked(serviceStoreData.excluded_service.prohibited)
    }
  }, [serviceStoreData])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
      <FormGroup row sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          label='Добавить в мотивацию'
          control={
            <Checkbox
              checked={excludedProhibitedChecked}
              disabled={disabled}
              name='basic-checked'
              onChange={event => {
                setExcludedChanged(true)
                setExcludedProhibitedChecked(event.target.checked)
              }}
            />
          }
        />
        <TextField
          disabled={disabled}
          placeholder='Комментарий к мотивации'
          size='small'
          name='comment'
          required={true}
          value={comment}
          error={error ? true : false}
          onChange={event => {
            setExcludedChanged(true)
            setComment(event.target.value)
          }}
        />
        {excludedChanged ? (
          <Button variant='contained' disabled={disabled} onClick={handleClick} sx={{ ml: 4 }}>
            Сохранить
          </Button>
        ) : null}
        {loader ? <CircularProgress sx={{ ml: 4 }} size='1rem' /> : <></>}
      </FormGroup>

      {error ? (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <></>
      )}
    </Box>
  )
}

export default ExcludedServices
