Collections
=============

## Creating collections {#collection-instances}

Collection instances can be created using the `new` keyword. The default constructor
for a collection accepts two optional parameters: `models` and `options`.

{% highlight js %}
let collection = new Collection(models = [], options = {});
{% endhighlight %}

### Models {#collection-instance-models}

You can provide initial models as an array of either model instances or plain
objects that should be converted into models. This follows the same behaviour
as [`add`](#collection-add), where a plain object will be passed as the `attributes`
argument to the collection's model type.

### Options {#collection-options}

The `options` parameter allows you to set the options of a collection instance. These
can be any of the default options or something specific to your collection.
To get the value of an option, use `option(name)`. You can also set an option
later on using `setOption(name, value)` or `setOptions(options)`.

You should define a collection's default options using the `options()` method:

{% highlight js %}
class TaskList extends Collection {
    options() {
        return {
            model: Task,
            useDeleteBody: false,
        }
    }
}

{% endhighlight %}

The collection's model type can also be determined dynamically by overriding the
`model` method, which by default returns the value of the `model` option.

{% highlight js %}
class TaskList extends Collection {
    model() {
        return Task;
    }
}
{% endhighlight %}


#### Available options {#collection-available-options}

|-------------------------+------------+-------------------+------------------------------------------------------------------------------------------------------------------------------------|
| Option                  | Type       | Default           | Description                                                                                                                        |
|:------------------------|:-----------|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|
| `model`                 | `Class`    | `Model`           | The class/constructor for this collection's model type.                                                                            |
|-------------------------+------------+-------------------+------------------------------------------------------------------------------------------------------------------------------------|
| `methods`               | `Object`   |                   | HTTP request methods.                                                                                                              |
|-------------------------+------------+-------------------+------------------------------------------------------------------------------------------------------------------------------------|
| `routeParameterPattern` | `Regex`    | `/\{([\w-.]*)\}/` | Route parameter group matching pattern.                                                                                            |
|-------------------------+------------+-------------------+------------------------------------------------------------------------------------------------------------------------------------|
| `useDeleteBody`         | `Boolean`  | `false`           | Whether this collection should send model identifiers as JSON data in the body of a delete request, instead of a query parameter.  |
|-------------------------+------------+-------------------+------------------------------------------------------------------------------------------------------------------------------------|

##### Default request methods
{% highlight js %}
{
    ...

    "methods" {
        "fetch":  "GET",
        "save":   "POST",
        "delete": "DELETE",
    }
}
{% endhighlight %}

## Models {#collection-models}

Models in a collection is an array that can be accessed as `models` on the collection.

{% highlight js %}
let task1 = {name: '1'};
let task2 = {name: '2'};

let tasks = new TaskList([task1, task2]);

tasks.models; // [<Task>, <Task>]
{% endhighlight %}

### Add {#collection-add}

You can add one or more models to a collection using `add(model)`, where `model`
can be a model instance, plain object, or array of either. Plain objects will be
used as the `attributes` argument of the collection's model option when converting
the plain object into a model instance.

Adding a model to a collection automatically registers the collection on the model,
so that the model can be removed when deleted successfully.

If no value for `model` is given, it will add a new empty model.

The added model will be returned, or an array of added models if more than one was given.

{% highlight js %}
let tasks = new TaskCollection();

// Adding a plain object.
let task1 = tasks.add({name: 'First'});

// Adding a model instance.
let task2 = tasks.add(new Task({name: 'Second'}));

// Adding a new empty model
let task3 = tasks.add();

let added = tasks.add([{name: '#4'}, {name: '#5'}]);
let task4 = added[0];
let task5 = added[1];

tasks.models; // [task1, task2, task3, task4, task5]
{% endhighlight %}

### Remove {#collection-remove}

You can remove a model instance using the `remove(model)` method, where `model` can
be a model instance, plain object, array, or function. Passing a plain object or
function will use `filter` to determine which models to remove, and an array of
models will call `remove` recursively for each element.

All removed models will be returned as either a single model instance or an array
of models depending on the type of the argument. A plain object, array or function will return an array,
where removing a specific model instance will only return that instance, if removed.

{% highlight js %}

// Remove all tasks that have been completed.
let done = tasks.remove({done: true});

// Adding a model instance.
let task2 = tasks.add(new Task({name: 'Second'}));

// Adding a new empty model
let task3 = tasks.add();

let added = tasks.add([{name: '#4'}, {name: '#5'}]);
let task4 = added[0];
let task5 = added[1];

tasks.models; // [task1, task2, task3, task4, task5]
{% endhighlight %}

### Replace  {#collection-replace}

You can replace the models of a collection using `replace(models)`, which is
effectively `clear` followed by `add(models)`. Models are replaced when new data
is fetched or when the constructor is called.

## Routes {#collection-routes}

Like models, routes are defined in a collection's `routes()` method. Expected but optional route keys
are **fetch**, **save**, and **delete**. Route parameters are returned by `getRouteParameters()`.
By default, route values are URL paths that support parameter interpolation with curly-brace syntax,
where the parameters are the collection's options and current page.

{% highlight js %}
class Task extends Model {
    routes() {
        save: '/task/{id}',
    }
}
{% endhighlight %}


**Note**: You can use `getURL(route, parameters = {})` to resolve a route's URL directly.

### Using a custom route resolver {#collection-route-resolver}

A *route resolver* translates a route value to a URL. The default resolver assumes
that route values are URL paths, and expects parameters to use curly-brace
syntax. You can use a custom resolver by overriding `getRouteResolver()`, returning a function
that accepts a route value and parameters.

For example, if you are using [laroute](https://github.com/aaronlord/laroute), your base collection might look like this:

 {% highlight js %}
class TaskList extends Collection {
    routes() {
        save: 'tasks.save', // Defined in Laravel, eg. `/tasks`
    }

    getRouteResolver() {
        return laroute.route;
    }
}
{% endhighlight %}

## Events {#collection-events}

You can add event listeners using `on(event, listener)`. Event context will always
consist of at least `target`, which is the collection that the event was emitted by.
Event names can be comma-separated to register a listener for multiple events.

{% highlight js %}
tasks.on('add', (event) => {
   console.log("Added", event.model);
})

tasks.on('remove', (event) => {
   console.log("Removed", event.model);
})
{% endhighlight %}


### add {#collection-events-add}
When a model has been added.
- `model` -- The model that was added.

### remove {#collection-events-remove}
When a model has been removed.
- `model` -- The model that was removed.

### fetch {#collection-events-fetch}
Before a collection's model data is fetched.
The request will be cancelled if any of the listeners return `false`.

Events will also be fired after the request has completed:
- `fetch.success`
- `fetch.failure`
- `fetch.always`

### save {#collection-events-save}
Before a collection's model data is saved.
The request will be cancelled if any of the listeners return `false`.

Events will also be fired after the request has completed:
- `save.success`
- `save.failure`
- `save.always`

### delete {#collection-events-delete}
Before a collection's models are deleted.
The request will be cancelled if any of the listeners return `false`.

Events will also be fired after the request has completed:
- `delete.success`
- `delete.failure`
- `delete.always`

## Requests {#collection-requests}

Collections support three actions: `fetch`, `save` and `delete`. These are called
directly on the collection, and accepts an object of callbacks for *sucess*, *failure* and *always*.
If a single callback is passed instead of an object, it will be used as the *always* handler.

{% highlight js %}
collection.save();

collection.save({
    success: (response) => {
        // Handle success here
    },
    failure: (error, response) => {
        // Handle failure here
    },
    always: (error, response) => {
        // Handle success or failure here
    }
})

collection.save((error, response) => {
    // Handle success or failure here
})

{% endhighlight %}

### Fetch {#collection-request-fetch}

You can *fetch* model data that belongs to a collection. Response data is
expected to be an array of attributes which will be passed to `replace`.

When a fetch request is made, `loading` will be `true` on the collection, and `false`
again when the data has been received and replaced (or if the request failed).
This allows the UI to indicate a loading state.

The request will be ignored if `loading` is already `true` when the request is made.

### Save {#collection-request-save}

Instead of calling `save` on each model individually, a collection will encode its
models as an array., using the results of each model's `getSaveBody()` method, which
defaults to the model's attributes. You can override `getSaveBody()` on the collection
to change this behaviour.

When a save request is made, `saving` will be `true` on the collection, and `false`
again when the response has been handled (or if the request failed).

The request will be ignored if `saving` is already `true` when the request is made,
which prevents the case where clicking a save button multiple times results in more
than one request.

#### Response {#collection-request-save-response}

In most case you would return an array of saved models in the response,
so that server-generated attributes like `date_created` or `id` can be applied.

Response data should be either an array of attributes, an array of model identifiers,
or nothing at all.

If an array is received, it will apply each object of attributes to its corresponding
model in the collection. A strict requirement for this to work is that the order of
the returned data must match the order of the models in the collection.

If the response is empty, it will be assumed that the active state of each model
is already its source of truth. This makes sense when a model doesn't use any
server-generated attributes and doesn't use an identifier.

#### Validation {#collection-request-save-validation}

Validation errors must be either an array of each model's validation errors (empty if there were none),
or an object that is keyed by model identifiers. These will be applied to each model in the same way
that the model would have done if it failed validation on save.

{% highlight js %}
// An array of errors for each model.
[
    {},
    {},
    {name: ['Must be a string']},
    {},
    ...
]

// An object of errors keyed by model identifier
{
    4: {name: ['Must be a string']},
}
{% endhighlight %}

### Delete {#collection-request-delete}

Instead of calling `delete` on each model individually, a collection collects
the identifiers of models to be deleted. If the `useDeleteBody` option is `true`,
identifiers will be sent in the body of the request, or in the URL query otherwise.

When a delete request is made, `deleting` will be `true` on the collection, and `false`
again when the response has been handled (or if the request failed).

The request will be ignored if `deleting` is already `true` when the request is made.

### Events {#collection-request-events}
Events will also be fired on the collection after the request has completed:
- `{action}.success`
- `{action}.failure`
- `{action}.always`

{% highlight js %}
collection.on('save.success', (event) => {
    // event.error
    // event.response
})
{% endhighlight %}

## Pagination {#collection-pagination}

You can enable pagination using the `page(integer)` method, which sets the current
page. If you want to disable pagination, pass `null` as the page. The `page` method
returns the collection so you can chain `fetch` if you want to.

A collection's page will automatically be incremented when a paginated fetch
request was successful. Models will be appended with `add` rather than replaced.

You can use `isLastPage()` or `isPaginated()` to determine the current status.
A collection is considered on its last page if the most recent paginated fetch request
did not return any models. This is reset again when you call `page` to set a new page.
A paginated `fetch` will be cancelled if the collection is on its last page.

Infinite scrolling can be achieved by calling `page(1)` initially, then `fetch()`
while `isLastPage()` is `false`.


{% highlight js %}
collection.page(1).fetch(() => {
    // Done.
});

{% endhighlight %}

## Methods {#collection-methods}

There are some convenient utility methods that makes some aggregation
and processing tasks a bit easier.

### first {#collection-first}

Returns the first model in the collection, or `undefined` if empty.

### last {#collection-last}

Returns the last model in the collection, or `undefined` if empty.

### shift {#collection-shift}

Removes and returns the first model of this collection, or `undefined` if the
collection is empty.

### pop {#collection-pop}

Removes and returns the last model of this collection, or `undefined` if the
collection is empty.

### find {#collection-find}

Returns the first model that matches the given criteria, or `undefined` if
none could be found. See [_.find](https://lodash.com/docs/#find).

{% highlight js %}
// Returns the first task that has not been completed yet.
tasks.find({done: false});

// Returns a task that is done and has a specific name.
tasks.find((task) => {
   return task.done && _.startsWith(task.name, 'Try to');
});
{% endhighlight %}

### has {#collection-has}

Returns `true` if the collection contains the model or has at least one model
that matches the given criteria. This method effectively checks if `indexOf`
returns a valid index.

### sort {#collection-sort}

Sorts the models of the collection in-place, using [_.sortBy](https://lodash.com/docs/#sortBy).
You will need to pass an attribute name or function to sort the models by.

{% highlight js %}
// Sorts the task list by name, alphabetically.
tasks.sort('name');

{% endhighlight %}

### sum {#collection-sum}

Returns the sum of all the models in the collection, based on an attribute name
or mapping function. See [_.sumBy](https://lodash.com/docs/#sumBy).

{% highlight js %}
// Returns the number of tasks that have been completed.
tasks.sum('done');

// Returns the total length of all task names.
tasks.sum((task) => {
    return task.name.length;
});

{% endhighlight %}

### map {#collection-map}

Returns an array that contains the returned result after applying a function to
each model in this collection. This method does not modify the collection's models,
unless the mapping function does so.
See [_.map](https://lodash.com/docs/#map).

{% highlight js %}

// Returns an array of task names.
tasks.map('name');

// Returns an array of the words in each task's name.
tasks.map((task) => _.words(task.name));

{% endhighlight %}

### count {#collection-count}

Returns an object composed of keys generated from the results of running each model
through `iteratee`. The corresponding value of each key is the number of times
the key was returned by iteratee. See [_.countBy](https://lodash.com/docs/#countBy).

{% highlight js %}

// Count how many tasks are done, or not done.
tasks.count('done'); // { true: 2, false: 1 }

// Adjust the keys.
tasks.count((task) => (task.done ? 'yes' : 'no')); // { "yes": 2, "no": 1 }

{% endhighlight %}

### reduce {#collection-reduce}

Reduces the collection to a value which is the accumulated returned result of each
model passed to a callback, where each successive invocation is supplied the return
value of the previous. See [_.reduce](https://lodash.com/docs/#reduce).

If `initial` is not given, the first model of the collection is used as the initial value.

The callback will be passed three arguments: `result`, `model`, and `index`.

{% highlight js %}

// Returns a flat array of every word of every task's name.
tasks.reduce((result, task) => _.concat(result, _.words(task.name)), []);

{% endhighlight %}

### each {#collection-each}

Iterates through all models, calling a given callback for each one.
The callback function receives `model` and `index`, and the iteration is stopped
if you return `false` at any stage. See [_.each](https://lodash.com/docs/#each).

{% highlight js %}

// Loop through each task, logging its details.
tasks.each((task, index) => {
    console.log(index, task.name, task.done);
})

{% endhighlight %}

### filter {#collection-filter}

Creates a new collection of the same type that contains only the models for
which the given predicate returns `true` for, or matches by property.
See [_.filter](https://lodash.com/docs/#filter).

{% highlight js %}

// Create two new collections, one containing tasks that have been completed,
// and another containing only tasks that have not been completed yet.
let done = tasks.filter((task) =>   task.done);
let todo = tasks.filter((task) => ! task.done);

// You can also use an attribute name only.
let done = tasks.filter('done');

{% endhighlight %}

### where {#collection-where}

Returns the models for which the given predicate returns `true` for, or models
that match attributes in an object. This is very similar to `filter`, but doesn't
create a new collection, it only returns an array of models.

### indexOf {#collection-index-of}

Returns the first index of a given model or attribute criteria, or `-1` if a model
could not be found. See [_.findIndex](https://lodash.com/docs/#findIndex).

<br><br>

[Back to the top](#introduction)