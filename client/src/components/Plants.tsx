import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPlant, deletePlant, getPlants, patchPlant } from '../api/plants-api'
import Auth from '../auth/Auth'
import { Plant } from '../types/Plant'

interface PlantsProps {
  auth: Auth
  history: History
}

interface PlantsState {
  plants: Plant[]
  newPlantName: string
  loadingPlants: boolean
}

export class Plants extends React.PureComponent<PlantsProps, PlantsState> {
  state: PlantsState = {
    plants: [],
    newPlantName: '',
    loadingPlants: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPlantName: event.target.value })
  }

  onEditButtonClick = (Id: string) => {
    this.props.history.push(`/plants/${Id}/edit`)
  }

  onPlantCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPlant = await createPlant(this.props.auth.getIdToken(), {
        name: this.state.newPlantName,
        dueDate
      })
      this.setState({
        plants: [...this.state.plants, newPlant],
        newPlantName: ''
      })
    } catch {
      alert('Plant creation failed')
    }
  }

  onPlantDelete = async (Id: string) => {
    try {
      await deletePlant(this.props.auth.getIdToken(), Id)
      this.setState({
        plants: this.state.plants.filter(plant => plant.Id != Id)
      })
    } catch {
      alert('Plant deletion failed')
    }
  }

  onPlantCheck = async (pos: number) => {
    try {
      const plant = this.state.plants[pos]
      await patchPlant(this.props.auth.getIdToken(), plant.Id, {
        name: plant.name,
        dueDate: plant.dueDate,
        done: !plant.done
      })
      this.setState({
        plants: update(this.state.plants, {
          [pos]: { done: { $set: !plant.done } }
        })
      })
    } catch {
      alert('Plant deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const plants = await getPlants(this.props.auth.getIdToken())
      this.setState({
        plants,
        loadingPlants: false
      })
    } catch (e) {
      alert(`Failed to fetch plants: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">PLANTs</Header>

        {this.renderCreatePlantInput()}

        {this.renderPlants()}
      </div>
    )
  }

  renderCreatePlantInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New plant',
              onClick: this.onPlantCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Add your favorite plant ..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPlants() {
    if (this.state.loadingPlants) {
      return this.renderLoading()
    }

    return this.renderPlantsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading PLANTs
        </Loader>
      </Grid.Row>
    )
  }

  renderPlantsList() {
    return (
      <Grid padded>
        {this.state.plants.map((plant, pos) => {
          return (
            <Grid.Row key={plant.Id}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPlantCheck(pos)}
                  checked={plant.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {plant.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {plant.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(plant.Id)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPlantDelete(plant.Id)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {plant.attachmentUrl && (
                <Image src={plant.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
