import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { Search, Button, Table } from './App';

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    test('has a valid snaphot', () => {
        const component = renderer.create(
          <App/>
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

});

describe('Search', () => {

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Search>Search Submit</Search>, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    test('has a valid snaphot', () => {
        const component = renderer.create(
            <Search>Search Submit</Search>
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

});

describe('Button', () => {

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Button>Dismiss</Button>, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('shows one button', () => {
        const element = shallow(
            <Button>Dismiss</Button>
        );

        expect(element.find('button').length).toBe(1);
    });

    test('has a valid snaphot', () => {
        const component = renderer.create(
            <Button>Dismiss</Button>
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

});

describe('Table', () => {

    const props = {
      list: [
          { title: 1, 'author': '1', num_comments: 1, points: 2, objectID: 'y' },
          { title: 2, 'author': '2', num_comments: 1, points: 2, objectID: 'z' },
      ],
      sortKey: 'TITLE',
      isSortReverse: true
    };

    it('shows two items in list', () => {
        const element = shallow(
            <Table { ...props } />
        );

        expect(element.find('.table-row').length).toBe(2);
    });

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Table { ...props } />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    test('has a valid snaphot', () => {
        const component = renderer.create(
            <Table { ...props } />
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

});

