import flask
from flask import request, jsonify, abort
from flask_cors import CORS
from operator import attrgetter

app = flask.Flask(__name__)
app.config["DEBUG"] = True

CORS(app)

users = []


@app.route('/users', methods=['GET'])
def index():

    #Quantity of users showed per page
    per_page = request.args.get('per_page')

    #Page that user wants do display
    page = request.args.get('page')

    #Split the users array into multiple arrays
    splitted = split(users, int(per_page) if per_page else 10)

    #Abort the request if the send an unexistent page
    if(page and len(splitted) < int(page)):
        abort(400)

    #Return the paginated response
    paginatedResponse = {
        'pages': len(splitted),
        'actualPage': int(page if page else 1),
        'data': splitted[int(page) - 1 if page else 0]
    }

    return jsonify(paginatedResponse)


@app.route('/users', methods=['POST'])
def create():
    data = request.get_json()

    #Sort the users array to find the higher id number
    users.sort(key=lambda x: x['id'], reverse=False)

    #Create a new user using the higher id + 1
    user = {
        'id': 1 if len(users) == 0 else users[len(users) - 1]['id'] + 1,
        'firstName': data['firstName'],
        'lastName': data['lastName'],
        'email': data['email']
    }

    #Add the user to the array
    users.append(user)

    return jsonify(user)


@app.route('/users/<id>', methods=['PUT'])
def update(id):

    #Validate if the given id exists
    validateId(id)

    data = request.get_json()

    #Create a new list with the updated user
    newList = [user if user['id'] != int(id) else {
        'id': user['id'], 'firstName': data['firstName'], 'lastName': data['lastName'], 'email': data['email']} for user in users]
    
    #Clear and substitute the current list
    users.clear()
    users.extend(newList)

    return jsonify(users)


@app.route('/users/<id>', methods=['GET'])
def show(id):
    #Validate if the given id exists
    validateId(id)

    #Find the user with the id
    user = [user for user in users if user['id'] == int(id)][0]

    return jsonify(user)


@app.route('/users/<id>', methods=['DELETE'])
def remove(id):
    #Validate if the given id exists
    validateId(id)

    #Create a new list with all users except the user with the given id
    newList = [user for user in users if user['id'] != int(id)]

    #Clear and substitute the current list 
    users.clear()
    users.extend(newList)

    return ('', 204)


def validateId(id):
    if(len([user for user in users if user['id'] == int(id)]) == 0):
        abort(400)

def split(arr, size):
    arrs = []
    while len(arr) > size:
        pice = arr[:size]
        arrs.append(pice)
        arr = arr[size:]
    arrs.append(arr)
    return arrs


app.run()
