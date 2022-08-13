
function CypherJS() {

  Data: {

    function StringRecoder() {
      const TrieNode = function() {
        return [{}, null];
      };
      const root = TrieNode();
      let code_factory = 1;
      const CHARS = 0;
      const CODE = 1;
      this.recode = function(_val: string) {
        if(!_val) return _val;
        let val = _val;
        if(!val.charAt) {
          val = ''+_val;
        }
        let n = root;
        let char;
        for(let i=0; i<val.length; i++) {
          char = val.charAt(i);
          if(!n[CHARS]![char]) {
            n[CHARS]![char] = TrieNode();
          }
          n = n[CHARS]![char];
        }
        return n[CODE] || (n[CODE] = code_factory++);
      };
    }

    function DB(engine) {
      const self = this;
      const nodes = [];
      let NODE_ID_FACTORY = 0;
      const nodeIdLookup = {};
      const labelNodeIdLookup = {};

      let relationships = [];
      let RELATIONSHIP_ID_FACTORY = 0;
      const relationshipLookup = {};
      const relationshipIdsByNodeIdLookup = {};
      const relationshipIdsByNodeIdLookupIncoming = {};
      const relationshipIdLookup = {};
      const typeRelationshipIdLookup = {};

      const tables = {};

      const stringRecoder = new StringRecoder();

      const recode = function(val) {
        return stringRecoder.recode(val);
      };
      const initializeRelationshipLookup = function(fromNodeId?: number, toNodeId?: number) {
        if(fromNodeId != undefined) {
          if(!relationshipLookup[fromNodeId]) {
            relationshipLookup[fromNodeId] = {};
          }
          if(toNodeId != undefined) {
            if(!relationshipLookup[fromNodeId][toNodeId]) {
              relationshipLookup[fromNodeId][toNodeId] = [];
            }
          }
        }
      };
      const lookupRelationships = function(fromNodeId?: number, toNodeId?: number) {
        initializeRelationshipLookup(fromNodeId, toNodeId);
        if(fromNodeId != undefined) {
          if(toNodeId != undefined) {
            return relationshipLookup[fromNodeId][toNodeId];
          } else if(toNodeId == undefined) {
            let relationshipIds = [];
            for(let nodeId in relationshipLookup[fromNodeId]) {
              relationshipIds = relationshipIds.concat(
                relationshipLookup[fromNodeId][nodeId]
              );
            }
            return relationshipIds;
          }
        }
        return [];
      };
      const addLookupRelationship = function(fromNodeId: number, toNodeId: number, relationshipId: number) {
        initializeRelationshipLookup(fromNodeId, toNodeId);
        relationshipLookup[fromNodeId][toNodeId].push(relationshipId);
        addLookupRelationshipIdsByNodeId(fromNodeId, relationshipId);
        addLookupRelationshipIdsByNodeIdIncoming(toNodeId, relationshipId);
      };
      const initializeRelationshipIdsByNodeIdLookup = function(nodeId: number) {
        if(!relationshipIdsByNodeIdLookup[nodeId]) {
          relationshipIdsByNodeIdLookup[nodeId] = [];
        }
      };
      const lookupRelationshipIdsByNodeId = function(nodeId: number) {
        initializeRelationshipIdsByNodeIdLookup(nodeId);
        return relationshipIdsByNodeIdLookup[nodeId];
      };
      const addLookupRelationshipIdsByNodeId = function(nodeId: number, relationshipId: number) {
        initializeRelationshipIdsByNodeIdLookup(nodeId);
        relationshipIdsByNodeIdLookup[nodeId].push(relationshipId);
      };
      const initializeRelationshipIdsByNodeIdLookupIncoming = function(nodeId: number) {
        if(!relationshipIdsByNodeIdLookupIncoming[nodeId]) {
          relationshipIdsByNodeIdLookupIncoming[nodeId] = [];
        }
      };
      const lookupRelationshipIdsByNodeIdIncoming = function(nodeId: number) {
        initializeRelationshipIdsByNodeIdLookupIncoming(nodeId);
        return relationshipIdsByNodeIdLookupIncoming[nodeId];
      };
      const addLookupRelationshipIdsByNodeIdIncoming = function(nodeId: number, relationshipId: number) {
        initializeRelationshipIdsByNodeIdLookupIncoming(nodeId);
        relationshipIdsByNodeIdLookupIncoming[nodeId].push(relationshipId);
      };
      const initializeNodeIdLookup = function(key: string, value: any[]) {
        if(!nodeIdLookup[key]) {
          nodeIdLookup[key] = {};
        }
        if(!nodeIdLookup[key][value]) {
          nodeIdLookup[key][value] = [];
        }
      };
      const lookupNodeIds = function(_key: string, _value: string) {
        const key = recode(_key),
          value = recode(_value);
        initializeNodeIdLookup(key, value);
        return nodeIdLookup[key][value];
      };
      const initializeRelationshipIdLookup = function(key: string, value: string) {
        if(!relationshipIdLookup[key]) {
          relationshipIdLookup[key] = {};
        }
        if(!relationshipIdLookup[key][value]) {
          relationshipIdLookup[key][value] = [];
        }
      };
      const addLookupNodeId = function(_key, _value, nodeId) {
        const key = recode(_key),
          value = recode(_value);
        initializeNodeIdLookup(key, value);
        nodeIdLookup[key][value].push(nodeId);
      };
      const addLookupRelationshipId = function(_key, _value, relationshipId) {
        const key = recode(_key),
          value = recode(_value);
        initializeRelationshipIdLookup(key, value);
        relationshipIdLookup[key][value].push(relationshipId);
      };
      const initializeLabelNodeIdLookup = function(label) {
        if(!labelNodeIdLookup[label]) {
          labelNodeIdLookup[label] = [];
        }
      };
      const lookupLabelNodeIds = function(_label) {
        const label = recode(_label);
        initializeLabelNodeIdLookup(label);
        return labelNodeIdLookup[label];
      };
      const initializeTypeRelationshipIdLookup = function(type) {
        if(!typeRelationshipIdLookup[type]) {
          typeRelationshipIdLookup[type] = [];
          return false;
        }
      };
      const addLabelNodeIdLookup = function(_label, nodeId) {
        const label = recode(_label);
        initializeLabelNodeIdLookup(label);
        const equalsNodeIdCheck = function(el) {
          return el == nodeId;
        };
        if(nodeId != undefined && !labelNodeIdLookup[label].find(equalsNodeIdCheck)) {
          labelNodeIdLookup[label].push(nodeId);
        }
      };
      this._addLabelNodeIdLookup = function(_label, nodeId) {
        addLabelNodeIdLookup(_label, nodeId);
      };
      const addTypeRelationshipIdLookup = function(_type, relationshipId) {
        if(relationshipId == undefined) {
          return;
        }
        const type = recode(_type);
        initializeTypeRelationshipIdLookup(type);
        const equalsRelationshipIdCheck = function(el) {
          return el == relationshipId;
        };
        if(!typeRelationshipIdLookup[type].find(equalsRelationshipIdCheck)) {
          typeRelationshipIdLookup[type].push(relationshipId);
          relationships[relationshipId].setStoredType(_type);
        }
      };
      this._addTypeRelationshipIdLookup = function(_type, relationshipId) {
        addTypeRelationshipIdLookup(_type, relationshipId);
      };
      const getFreeNodeId = function() {
        while(nodes[NODE_ID_FACTORY]) {
          NODE_ID_FACTORY++;
        }
        return NODE_ID_FACTORY;
      };
      const addNode = function(node, givenId?: number) {
        if(!givenId) {
          node.setId(getFreeNodeId());
          nodes[node.id()] = node;
        } else if(givenId) {
          if(nodes[givenId]) {
            throw "Node with ID " + givenId + " already exists in the database.";
          }
          node.setId(givenId);
          nodes[givenId] = node;
        }
        for(let key in node.getRawProperties()) {
          addLookupNodeId(
            key,
            node.getLocalProperty(key),
            node.id()
          );
        }
        for(let label in node.labels()) {
          addLabelNodeIdLookup(
            label,
            node.id()
          );
        }
        engine.statement().setNodesAdded(
          engine.statement().getNodesAdded()+1
        );
      };
      const getFreeRelationshipId = function() {
        while(relationships[RELATIONSHIP_ID_FACTORY]) {
          RELATIONSHIP_ID_FACTORY++;
        }
        return RELATIONSHIP_ID_FACTORY;
      };
      const addRelationship = function(relationship, givenId?: number) {
        let relationshipId = null;
        if(!givenId) {
          relationshipId = getFreeRelationshipId();
        } else if(givenId) {
          if(nodes[givenId]) {
            throw "Relationship with ID " + givenId + " already exists in the database.";
          }
          relationshipId = givenId;
        }
        relationship.setId(relationshipId);
        relationships[relationshipId] = relationship;

        addLookupRelationship(
          relationship.getFromNode().id(),
          relationship.getToNode().id(),
          relationship.id()
        );

        if(relationship.getToNode().id() != relationship.getFromNode().id()) {
          addLookupRelationship(
            relationship.getToNode().id(),
            relationship.getFromNode().id(),
            relationship.id()
          );
        }

        for(let key in relationship.getProperties()) {
          addLookupRelationshipId(
            key,
            relationship.getProperty(key),
            relationship.id()
          );
        }
        addTypeRelationshipIdLookup(
          relationship.getType(),
          relationship.id()
        );
        relationship.setIsAdded();
        engine.statement().setRelationshipsAdded(
          engine.statement().getRelationshipsAdded()+1
        );
      };

      // Does the specified relationship exist between
      // fromNode and toNode?
      const relationshipMatch = function(relationship, fromNode, toNode) {
        let relationshipIds = [];
        let relationshipIdsFromLookup;

        if(!relationship.isReferred()) {

          if(fromNode && toNode) {
            relationshipIdsFromLookup = lookupRelationships(
              fromNode.id(),
              toNode.id()
            );
            relationshipIds = relationshipIds.concat(
              relationshipIdsFromLookup
            );
          } else if(fromNode && !toNode) {
            relationshipIdsFromLookup =
              lookupRelationshipIdsByNodeId(fromNode.id());
            if(relationship.uniDirectional()) {
              relationshipIdsFromLookup.concat(
                lookupRelationshipIdsByNodeIdIncoming(fromNode.id())
              );
            }
            relationshipIds = relationshipIds.concat(
              relationshipIdsFromLookup
            );
          }

        } else if(relationship.isReferred()) {
          const referredRelationship = relationship.getReferredRelationship().getData();
          if(referredRelationship) {
            if(!(referredRelationship.constructor == Relationship ||
              referredRelationship.constructor == RelationshipReference)) {
              throw "Expected relationship.";
            }
          } else {
            throw "Expected relationship.";
          }
          relationshipIds.push(
            referredRelationship.id()
          );
        }

        if(relationshipIds.length==0) {
          // There is no relationship between fromNode and toNode
          return false;
        }

        const matcher = new Matcher();
        matcher.setMatchingSet(relationshipIds, 0);

        // Does the relationship have a direction
        if(relationship.leftDirection() || relationship.rightDirection()) {
          matcher.incrementToMatchCount(); // Match direction
        }
        // Does the pattern have a type?
        if(relationship.getType()) { // If so, then
          matcher.incrementToMatchCount(); // Match type
        }
        for(let key in relationship.getProperties()) {
          matcher.incrementToMatchCount();
        }

        if(matcher.toMatchCount() > 0) {
          let dbRelationship;
          for(let i=0; i<relationshipIds.length; i++) {
            dbRelationship = relationships[relationshipIds[i]];

            // Does the relationship have a direction
            if(relationship.leftDirection() || relationship.rightDirection()) {
              // Match direction if any
              if(relationship.leftDirection() == dbRelationship.leftDirection(fromNode.id()) ||
                relationship.rightDirection() == dbRelationship.rightDirection(fromNode.id())) {
                matcher.keepMatchTally(relationshipIds[i]);
              }
            }

            // Does the pattern have a type?
            if(relationship.getType()) { // If so, then
              // Match type if any
              if(dbRelationship.getType() &&
                dbRelationship.getType() == relationship.getType()) {
                matcher.keepMatchTally(relationshipIds[i]);
              }
            }
            // Match relationship pattern properties, if any
            for(let key in relationship.getProperties()) {
              if(relationship.getLocalProperty(key) == dbRelationship.getLocalProperty(key)) {
                matcher.keepMatchTally(relationshipIds[i]);
              }
            }

          }
          matcher.updateMatchingSet();
        }

        if(matcher.matchingSetSize() == 0) {
          return false;
        }
        return matcher.matchingSet();
      };

      this.createNode = function(node) {

        let nodeInstance;

        if(node.isReferred()) {
          nodeInstance =
            node.getReferredNode().getData();
        } else {
          node.bindProperties();
          nodeInstance = node.copy();
          addNode(nodeInstance);
          node.addMatchedNode(nodeInstance); // Add to matched nodes set
        }

        if(node.outgoingRelationship()) {
          node.outgoingRelationship().setFromNode(nodeInstance);
        }

        if(node.incomingRelationship()) {
          node.incomingRelationship().bindProperties();
          node.incomingRelationship().setToNode(nodeInstance);
          const relationshipToAdd = node.incomingRelationship().copy();
          addRelationship(relationshipToAdd);
          node.incomingRelationship().addMatchedRelationship(
            relationshipToAdd
          );
        }

        if(node.nextNode()) {
          node.nextNode().create();
        } else if(!node.nextNode()) {
          node.nextAction();
        }

      };

      function Matcher() {
        let toMatchCount = 0;
        let idsMatchCount = [];
        let matchingSet = [];
        this.setMatchingSet = function(_matchingSet, initialMatchCount) {
          matchingSet = _matchingSet;
          idsMatchCount =
            new Array(
              matchingSet.length
            ).fill(
              initialMatchCount != undefined ?
                initialMatchCount : 1
            );
        };
        this.addToMatchingSet = function(id) {
          matchingSet.push(parseInt(id));
          idsMatchCount.push(0);
        };
        this.updateMatchingSet = function() {
          let carryOverCount = 0;
          for(let i=0; i<matchingSet.length; i++) {
            if(idsMatchCount[i] == toMatchCount) {
              carryOverCount++;
            }
          }
          const newMatchingSet = new Array(carryOverCount);
          let new_i = 0;
          for(let i=0; i<matchingSet.length; i++) {
            if(idsMatchCount[i] == toMatchCount) {
              newMatchingSet[new_i++] = matchingSet[i];
            }
          }
          matchingSet = newMatchingSet;
          idsMatchCount = new Array(matchingSet.length).fill(toMatchCount);
        };
        this.incrementToMatchCount = function() {
          toMatchCount++;
        };
        this.keepMatchTally = function(id) {
          for(let i=0; i<matchingSet.length; i++) {
            if(matchingSet[i] == id) {
              idsMatchCount[i] = (idsMatchCount[i] + 1 || 1);
            }
          }
        };
        this.toMatchCount = function() {
          return toMatchCount;
        };
        this.matchingSet = function() {
          return matchingSet;
        };
        this.matchingSetSize = function() {
          return matchingSet.length;
        };
      };

      const matchNodeProperties = function(node, matcher) {
        let nodeIds;
        // For all property keys in the node pattern
        for(let key in node.getProperties()) {

          node.bindProperty(key);

          // This is the first pattern criteria to match
          // so get all node ids that match
          if(matcher.toMatchCount() == 0 && matcher.matchingSetSize() == 0) {

            nodeIds =
              lookupNodeIds(
                key,
                node.getLocalProperty(key)
              );
            if(nodeIds) {
              matcher.setMatchingSet(nodeIds);
            }

            // There are matching node ids that match given patterns so far
            // Only work with those node ids going forward
          } else if(matcher.matchingSetSize() > 0) {

            // For each of the node ids that match given patterns so far
            for(let i=0; i<matcher.matchingSetSize(); i++) {
              if(node.getLocalProperty(key) == nodes[matcher.matchingSet()[i]].getLocalProperty(key)) {
                matcher.keepMatchTally(matcher.matchingSet()[i]);
              }
            }

          }

          matcher.incrementToMatchCount();
          matcher.updateMatchingSet();

        }
      };

      const matchNodeLabels = function(node, matcher) {
        let nodeIds;
        for(let label in node.labels()) {

          // This is the first pattern criteria to match
          // so get all node ids that match
          if(matcher.toMatchCount() == 0 && matcher.matchingSetSize() == 0) {
            // Labels are also part of the merging candidate matching set
            // Same algorithm as for node properties above,
            // but for labels
            nodeIds = lookupLabelNodeIds(label);
            if(nodeIds) {
              matcher.setMatchingSet(nodeIds);
            }

            // There are matching node ids that match given patterns so far
            // Only work with those node ids going forward
          } else if(matcher.matchingSetSize() > 0) {
            // For each of the node ids that match given patterns so far
            for(let i=0; i<matcher.matchingSetSize(); i++) {
              if(nodes[matcher.matchingSet()[i]].hasLabel(label)) {
                matcher.keepMatchTally(matcher.matchingSet()[i]);
              }
            }

          }

          matcher.incrementToMatchCount();
          matcher.updateMatchingSet();

        }
      };

      const conveyorBelt = function(node, merge, _pathExpansionDepth) {
        if(node.nextNode()) {
          if(node.getPattern().usedAsCondition()) {
            return node.nextNode().convey(merge, _pathExpansionDepth);
          } else {
            node.nextNode().convey(merge, _pathExpansionDepth);
          }
        } else if(!node.nextNode()) {
          // Last node in pattern
          // So push everything matched in pattern
          // to the next operation on the conveyor belt
          if(node.getPattern().usedAsCondition()) {
            return node.nextAction();
          } else {
            node.nextAction();
          }
        }
      };

      const processNodeMatcher = function(matcher) {
        let nodeIdsForConveyorBelt = [];
        if(matcher.matchingSetSize() > 0) {
          // There is at least one node id that matches
          // everything from the merging candidate (labels and properties)

          // Todo: Add code here to set labels and/or properties, i.e.
          // from "set" clause

          // Add all nodes that match everything to matched nodes set
          nodeIdsForConveyorBelt = matcher.matchingSet();
        } else if(matcher.toMatchCount() == 0) {
          // Match any node so add all nodes from database to matched nodes
          nodeIdsForConveyorBelt = new Array(nodes.length);
          for(let i=0; i<nodes.length; i++) {
            nodeIdsForConveyorBelt[i] = nodes[i].id();
          }
        }
        return nodeIdsForConveyorBelt;
      };

      const getMatchingNodeIds = function(node, merge) {
        let nodeIdsForConveyorBelt = [];

        if(!node.isExpanded()) {
          const matcher = new Matcher();

          if(node.isReferred()) {
            const referredNode = node.getReferredNode().getData();
            if(referredNode) {
              if(!(referredNode.constructor == Node ||
                referredNode.constructor == NodeReference)) {
                throw "Expected node.";
              }
            } else {
              throw "Expected node.";
            }
            matcher.addToMatchingSet(
              referredNode.id()
            );
          }

          // There is an incoming relationship pattern
          if(node.incomingRelationship()) {
            if(node.incomingRelationship().hasExpandedEndNode() && !node.isReferred()) {
              matcher.addToMatchingSet(
                node.incomingRelationship().getExpandedEndNode().id()
              );
            }
          }

          matchNodeProperties(node, matcher);
          matchNodeLabels(node, matcher);

          nodeIdsForConveyorBelt = processNodeMatcher(matcher);

          if(nodeIdsForConveyorBelt.length == 0 && merge) {
            if(node.getPattern().usedAsCondition()) {
              return false;
            } else {
              node.getPattern().create();
              return;
            }
          }

        } else if(node.isExpanded()) {
          nodeIdsForConveyorBelt = [node.getExpandedNode().id()];
        }
        return nodeIdsForConveyorBelt;
      };

      const processNodeWithoutRelationships = function(node, nodeId, merge, pathExpansionDepth) {
        if(!node.incomingRelationship() && !node.outgoingRelationship()) {
          node.addMatchedNode(nodes[nodeId]);
          if(node.getPattern().usedAsCondition()) {
            return conveyorBelt(node, merge, pathExpansionDepth);
          } else {
            conveyorBelt(node, merge, pathExpansionDepth);
          }
        }
      };

      const processNodeWithOutgoingRelationship = function(node, nodeIdIndex, nodeId, merge, pathExpansionDepth) {
        let returnValue;
        if(node.outgoingRelationship()) {
          const matchingRelationshipIds =
            getMatchingRelationshipIds(node, nodeIdIndex, nodeId, pathExpansionDepth);
          if(!matchingRelationshipIds && merge) {
            node.getPattern().create();
            returnValue = -1;
          } else if(matchingRelationshipIds.length > 0) {
            returnValue = processMatchingRelationships(node, nodeId, merge, pathExpansionDepth, matchingRelationshipIds);
            if(returnValue != undefined) return returnValue;
            // Breadth-first path expansion
            returnValue = pathExpansion(node, nodeId, pathExpansionDepth, matchingRelationshipIds);
            if(returnValue != undefined) return returnValue;
          }
        }
        return returnValue;
      };

      const processNodeWithIncomingRelationship = function(node, nodeId, merge, pathExpansionDepth) {
        let returnValue;
        // Check if there is an incoming relationship
        if(node.incomingRelationship()) {
          node.addMatchedNode(nodes[nodeId]);

          if(node.incomingRelationship().hasExpandedEndNode()) {

            let convey = true;

            if(node.isReferred()) {
              if(node.getReferredNode().getData().id() != node.incomingRelationship().getExpandedEndNode().id()) {
                convey = false;
              }
            }

            if(convey) {
              if(node.getPattern().usedAsCondition()) {
                returnValue = conveyorBelt(node, merge, pathExpansionDepth);
                if(returnValue != undefined) return returnValue;
              } else {
                conveyorBelt(node, merge, pathExpansionDepth);
              }
            }

          }
        }
      };

      const getMatchingRelationshipIds = function(node, nodeIdIndex, nodeId, pathExpansionDepth) {
        if(!pathExpansionDepth && node.outgoingRelationship().expandPath() && nodeIdIndex > 0) {
          node.outgoingRelationship().resetExpandedPath();
        }

        if(!node.isExpanded()) {
          // Start node in path expansion (if any)
          node.addMatchedNode(nodes[nodeId]);
          node.outgoingRelationship().setFromNode(nodes[nodeId]);
        }

        let toNode = null;

        if(node.outgoingRelationship().getNextObject().isReferred() &&
          !node.outgoingRelationship().hasVariablePathLength()) {
          toNode = node.outgoingRelationship().getNextObject().getReferredNode().getData();
        }

        node.outgoingRelationship().bindProperties();

        return relationshipMatch(
          node.outgoingRelationship(),
          nodes[nodeId],
          toNode
        );
      };

      const processMatchingRelationships = function(node, nodeId, merge, pathExpansionDepth, matchingRelationshipIds: number[]) {
        let returnValue;
        let relationship;
        for(let relationshipIdIdx=0; relationshipIdIdx<matchingRelationshipIds.length; relationshipIdIdx++) {
          // @ts-ignore
          relationship = relationships[[matchingRelationshipIds[relationshipIdIdx]]];

          if(node.outgoingRelationship().pathLengthSatisfied()) {

            node.outgoingRelationship().setExpandedEndNode(
              relationship.getToNode(nodeId)
            );

            node.outgoingRelationship().setMatchedRelationship(relationship);

            if(node.getPattern().usedAsCondition()) {
              returnValue = conveyorBelt(node, merge, pathExpansionDepth);
              if(returnValue != undefined) return returnValue;
            } else {
              conveyorBelt(node, merge, pathExpansionDepth);
            }

            node.outgoingRelationship().setExpandedEndNode(null);

          }

        }
      };

      const pathExpansion = function(node, nodeId, pathExpansionDepth, matchingRelationshipIds) {
        if(node.outgoingRelationship().expandPath()) {
          for(let relationshipIdIdx=0; relationshipIdIdx<matchingRelationshipIds.length; relationshipIdIdx++) {
            let relationship;
            // @ts-ignore
            relationship = relationships[[matchingRelationshipIds[relationshipIdIdx]]];

            node.outgoingRelationship().addMatchedRelationship(
              relationship,
              {fromNodeId: nodeId, toNodeId: relationship.getToNode(nodeId).id()}
            );

            if(node.outgoingRelationship().visitedBefore(relationship.getToNode(nodeId).id())) {
              node.outgoingRelationship().backTrackExpandedPath();
              continue;
            }

            // Path expansion code
            if(node.outgoingRelationship().pathLengthSatisfied()) {

              node.setExpandedNode(
                relationship.getToNode(nodeId)
              );

              self.matchNode(
                node,
                false,
                (pathExpansionDepth || 0) + 1
              ); // Path expansion is only allowed for match

              //node.outgoingRelationship().backTrackExpandedPath();
              node.setExpandedNode(
                null
              );

            }

            if(node.outgoingRelationship().expandPath() && !pathExpansionDepth) {
              node.outgoingRelationship().backTrackExpandedPath();
            }

          }
        }
      };

      this.matchNode = function(node, merge, pathExpansionDepth) {
        let returnValue;

        const nodeIdsForConveyorBelt =
          getMatchingNodeIds(node, merge);

        if(nodeIdsForConveyorBelt && nodeIdsForConveyorBelt.length) {
          for(let nodeIdIndex=0; nodeIdIndex<nodeIdsForConveyorBelt.length; nodeIdIndex++) {
            const nodeId = nodeIdsForConveyorBelt[nodeIdIndex];

            returnValue = processNodeWithoutRelationships(node, nodeId, merge, pathExpansionDepth);
            if(returnValue != undefined) return returnValue;
            returnValue = processNodeWithOutgoingRelationship(node, nodeIdIndex, nodeId, merge, pathExpansionDepth);
            if(returnValue != undefined) return returnValue;
            returnValue = processNodeWithIncomingRelationship(node, nodeId, merge, pathExpansionDepth);
            if(returnValue != undefined) return returnValue;

          }
        }

        if(node.getPattern().usedAsCondition()) {
          return false;
        }

      };

      this.getNodeById = function(id) {
        return nodes[id];
      };
      this.getRelationshipById = function(id) {
        return relationships[id];
      };

      this.addNode = function(node) {
        const n = new Node(this);
        n.setProperties(node.properties);
        n.setLabels(node.labels);
        addNode(n, node.id);
      };
      this.addRelationship = function(relationship) {
        const r = new Relationship(db);
        r.setFromNode(this.getNodeById(relationship.from));
        r.setToNode(this.getNodeById(relationship.to));
        r.setProperties(relationship.properties);
        r.setType(relationship.type);
        addRelationship(r, relationship.id);
      };

      this.addTable = function(table) {
        tables[table.name()] = table;
      };
      this.getTable = function(tableName) {
        if(!(tableName in tables)) {
          throw "Table \"" + tableName + "\" does not exist.";
        }
        return tables[tableName];
      };
    };

    function Node(_db) {

      const db = _db;
      let id;
      const labels = {};
      const propertyExpressions = {};
      let properties = {};

      let variableKey;
      let referredNode = null;
      let expandedNode = null;
      const me = this;

      let previousObject;
      let nextObject;

      let pattern;

      let expandedIsMatched = false;

      this.setPreviousObject = function(object) {
        previousObject = object;
      };
      this.getPreviousObject = function() {
        return previousObject;
      };
      this.setNextObject = function(object) {
        nextObject = object;
      };
      this.getNextObject = function() {
        return nextObject;
      };
      this.setPattern = function(_pattern) {
        pattern = _pattern;
      };
      this.getPattern = function() {
        return pattern;
      };
      this.nextNode = function() {
        if(me.getNextObject()) {
          if(me.getNextObject().isRelationship()) {
            return me.getNextObject().getNextObject();
          } else if(me.getNextObject().isNode()) {
            return me.getNextObject();
          }
        }
        return null;
      };
      this.previousNode = function() {
        if(me.getPreviousObject()) {
          if(me.getPreviousObject().isRelationship()) {
            return me.getPreviousObject().getPreviousObject();
          } else if(me.getPreviousObject().isNode()) {
            return me.getPreviousObject();
          }
        }
        return null;
      };
      this.incomingRelationship = function() {
        if(me.getPreviousObject()) {
          if(me.getPreviousObject().isRelationship()) {
            return me.getPreviousObject();
          }
        }
        return null;
      };
      this.outgoingRelationship = function() {
        if(me.getNextObject()) {
          if(me.getNextObject().isRelationship()) {
            return me.getNextObject();
          }
        }
        return null;
      };

      this.setId = function(_id) {
        id = _id;
      };
      this.id = function() {
        return id;
      };
      this.getId = this.id;
      this.setProperty = function(key, expression) {
        properties[key] = null;
        propertyExpressions[key] = expression.value;
      };
      this.setProperties = function(_properties) {
        for(const key in _properties) {
          properties[key] = _properties[key];
        }
      };
      this.setNewProperties = function(_properties) {
        properties = {};
        for(const key in _properties) {
          properties[key] = _properties[key];
        }
      };
      this.bindProperty = function(key) {
        properties[key] = propertyExpressions[key]();
      };
      this.bindProperties = function() {
        for(const key in properties) {
          this.bindProperty(key);
        }
      };
      this.setLabel = function(labelName, nodeId) {
        labels[labelName] = true;
        db._addLabelNodeIdLookup(labelName, nodeId);
      };
      this.hasLabel = function(labelName) {
        return labels[labelName];
      };
      this.setLabels = function(_labels) {
        for(const label in _labels) {
          labels[label] = _labels[label];
        }
      };
      this.setVariableKey = function(_variableKey) {
        variableKey = _variableKey;
      };
      this.getVariableKey = function() {
        return variableKey;
      };
      this.hasVariableKey = function() {
        return variableKey != undefined;
      };
      this.getProperties = function() {
        return Object.create(properties);
      };
      this.getRawProperties = function() {
        return properties;
      };
      this.labels = function() {
        return labels;
      };
      this.getLabels = function() {
        return Object.keys(labels);
      };
      this.hasLabels = function() {
        return Object.keys(labels).length > 0;
      };
      this.hasProperties = function() {
        return Object.keys(properties).length > 0;
      };

      const NodeInstance = function(nodeInstance) {
        const self = this;
        for(const key in nodeInstance) {
          this[key] = nodeInstance[key];
        }
        this.getId = function() {
          return self.id;
        };
        this.getData = function() {
          return self;
        };
        this.getObject = function() {
          return self;
        };
        this.groupByKey = function() {
          return self.id;
        };
        this.groupByValue = function() {
          return self;
        };
      };
      this.get = function(asKey) {
        if(asKey) {
          return id;
        }
        /*return new NodeInstance({
					id: id,
					labels: this.getLabels(),
					properties: properties,
					getProperty: function() { return properties[key]; }
				});*/
        return new NodeReference(db, id);
      };
      this.toObject = function() {
        return new NodeInstance({
          id: id,
          labels: this.getLabels(),
          properties: addAssociativeArrayFunctions(properties),
          getProperty: function() { return properties[key]; },
          getProperties: function() { return this.properties; },
          getLabels: function() { return this.labels; },
          getKeys: function() {
            return this.properties.getKeys();
          }
        });
      };
      this.toString = function() {
        return JSON.stringify(this.get());
      };
      this.type = function() {
        return this.constructor.name;
      };

      this.isRelationship = function() {
        return false;
      };
      this.isNode = function() {
        return true;
      };
      this.setReferredNode = function(_referredNode) {
        referredNode = _referredNode;
      };
      this.isReferred = function() {
        return referredNode != null;
      };
      this.getReferredNode = function() {
        return referredNode;
      };

      this.setExpandedIsMatched = function() {
        expandedIsMatched = true;
      };
      this.expandedIsMatched = function() {
        if(expandedIsMatched) {
          expandedIsMatched = false;
          return true;
        }
        return false;
      };
      this.setExpandedNode = function(_expandedNode) {
        expandedNode = _expandedNode;
      };
      this.isExpanded = function() {
        return expandedNode != null;
      };
      this.getExpandedNode = function() {
        return expandedNode;
      };

      this.nextAction = function() {
        ;
      };
      this.setNextAction = function(f) {
        this.nextAction = f;
      };
      this.convey = function(merge, pathExpansionDepth) {
        return db.matchNode(
          me,
          merge,
          // match: merge == false
          // merge: merge == true
          pathExpansionDepth
        );
      };
      this.create = function() {
        return db.createNode(me);
      };
      this.merge = function() {
        return db.mergeNode(me);
      };
      this.match = function() {
        return db.matchNodes(me);
      };

      let matchedNode;
      const matchedIncomingRelationshipIds = {};

      this.addMatchedNode = function(node) {
        matchedNode = node.id();
      };
      this.getMatchedNode = function() {
        return this.getData();
      };
      this.addMatchedIncomingRelationshipId = function(nodeId, matchedIncomingRelationshipId) {
        if(!matchedIncomingRelationshipIds[nodeId]) {
          matchedIncomingRelationshipIds[nodeId] = [];
        }
        matchedIncomingRelationshipIds[nodeId].push(matchedIncomingRelationshipId);
      };
      this.getMatchedIncomingRelationshipIds = function(nodeId) {
        if(!matchedIncomingRelationshipIds[nodeId]) {
          return null;
        }
        const _matchedIncomingRelationshipIds = matchedIncomingRelationshipIds[nodeId];
        matchedIncomingRelationshipIds[nodeId] = [];
        return _matchedIncomingRelationshipIds;
      };

      this.getData = function() {
        return db.getNodeById(matchedNode);
      };
      this.getLocalProperty = function(key) {
        return properties[key] || null;
      };
      this.getProperty = function(key) {
        if(!db.getNodeById(matchedNode)) return null;
        return db.getNodeById(matchedNode).getLocalProperty(key);
      };
      this.groupByKey = function() {
        return this.getData().id();
      };
      this.groupByValue = function() {
        return this.getData().get();
      };

      this.copy = function() {
        const n = new Node(db);
        n.setLabels(labels);
        n.setProperties(properties);
        return n;
      };

      this.mappable = function() {
        if(referredNode) {
          if(referredNode.mappable && !referredNode.mappable()) {
            return false;
          }
        }
        for(const propertyKey in properties) {
          if(!propertyExpressions[propertyKey].mappable()) {
            return false;
          }
        }
        return true;
      };
    };

    function Relationship(_db) {
      const db = _db;
      let id;
      let relationshipType;
      const properties = {};
      const propertyExpressions = {};
      let fromNode;
      let toNode;
      let leftDirection;
      let rightDirection;
      let variableKey;

      let previousObject;
      let nextObject;

      let isAdded = false;

      let hasVariablePathLength = false;
      let pathLengthFrom = 1;
      let pathLengthTo = 1;

      let pattern;

      let referredRelationship = null;

      this.setPreviousObject = function(object) {
        previousObject = object;
      };
      this.getPreviousObject = function() {
        return previousObject;
      };
      this.setNextObject = function(object) {
        nextObject = object;
      };
      this.getNextObject = function() {
        return nextObject;
      };
      this.setPattern = function(_pattern) {
        pattern = _pattern;
      };
      this.getPattern = function() {
        return pattern;
      };

      this.setId = function(_id) {
        id = _id;
      };
      this.id = function() {
        return id;
      };
      this.setStoredType = function(_type) {
        relationshipType = _type;
      };
      this.setType = function(_type, relationshipId) {
        relationshipType = _type;
        //db._addTypeRelationshipIdLookup(relationshipType, relationshipId);
      };
      this.getType = function() {
        return relationshipType;
      };
      this.setProperty = function(key, expression) {
        properties[key] = null;
        propertyExpressions[key] = expression.value;
      };
      this.bindProperty = function(key) {
        properties[key] = propertyExpressions[key]();
      };
      this.bindProperties = function() {
        for(const key in properties) {
          this.bindProperty(key);
        }
      };
      this.setProperties = function(_properties) {
        for(const key in _properties) {
          properties[key] = _properties[key];
        }
      };
      this.getProperty = function(key) {
        return properties[key];
      };
      this.getProperties = function() {
        return properties;
      };
      this.getRelationshipProperties = function() {
        return properties;
      };
      this.setFromNode = function(node) {
        fromNode = node;
      };
      this.setToNode = function(node) {
        toNode = node;
      };
      this.getFromNode = function(fromNodeId) {
        if(fromNodeId != undefined) {
          if(fromNodeId != fromNode.id()) {
            return toNode;
          }
        }
        return fromNode;
      };
      this.getToNode = function(fromNodeId) {
        if(fromNodeId != undefined) {
          if(fromNodeId != fromNode.id()) {
            return fromNode;
          }
        }
        return toNode;
      };
      this.setLeftDirection = function(_leftDirection) {
        leftDirection = _leftDirection;
      };
      this.setRightDirection = function(_rightDirection) {
        rightDirection = _rightDirection;
      };
      this.leftDirection = function(fromNodeId) {
        if(fromNodeId != undefined) {
          if(fromNodeId != fromNode.id()) {
            return !leftDirection && rightDirection;
          }
        }
        return leftDirection && !rightDirection;
      };
      this.rightDirection = function(fromNodeId) {
        if(fromNodeId != undefined) {
          if(fromNodeId != fromNode.id()) {
            return !rightDirection && leftDirection;
          }
        }
        return rightDirection && !leftDirection;
      };
      this.uniDirectional = function() {
        return (rightDirection && leftDirection) || (!leftDirection && !rightDirection);
      };
      this.noDirection = function() {
        return !leftDirection && !rightDirection;
      };
      this.direction = function() {
        const l = this.leftDirection();
        const r = this.rightDirection();
        if(l && !r) {
          return "left";
        }
        if(!l && r) {
          return "right";
        }
        if(l && r) {
          return "both";
        }
        return "none";
      };
      this.type = function() {
        return this.constructor.name;
      };

      this.isRelationship = function() {
        return true;
      };
      this.isNode = function() {
        return false;
      };

      this.setReferredRelationship = function(_referredRelationship) {
        referredRelationship = _referredRelationship;
      };
      this.isReferred = function() {
        return referredRelationship != null;
      };
      this.getReferredRelationship = function() {
        return referredRelationship;
      };

      this.isAdded = function() {
        return isAdded;
      };
      this.setIsAdded = function() {
        isAdded = true;
      };
      this.setHasVariablePathLength = function() {
        hasVariablePathLength = true;
        pathLengthFrom = null;
        pathLengthTo = null;
      };
      this.hasVariablePathLength = function() {
        return hasVariablePathLength;
      };
      this.setPathLengthFrom = function(_pathLengthFrom) {
        pathLengthFrom = _pathLengthFrom;
      };
      this.pathLengthFrom = function() {
        return pathLengthFrom;
      };
      this.setPathLengthTo = function(_pathLengthTo) {
        pathLengthTo = _pathLengthTo;
      };
      this.pathLengthTo = function() {
        return pathLengthTo;
      };
      this.expandPath = function() {
        return hasVariablePathLength;
      };

      const RelationshipInstance = function(relationshipInstance) {
        for(const key in relationshipInstance) {
          this[key] = relationshipInstance[key];
        }
        this.getId = function() {
          return this.id;
        };
        this.getData = function() {
          return this;
        };
        this.getObject = function() {
          return this;
        };
        this.groupByKey = function() {
          return this.id;
        };
        this.groupByValue = function() {
          return this;
        };
      };
      this.get = function() {
        return new RelationshipReference(db, id);
      };
      this.toObject = function() {
        return new RelationshipInstance({
          id: id,
          type: relationshipType,
          properties: addAssociativeArrayFunctions(properties),
          fromNode: (fromNode ? fromNode.get() : null),
          toNode: (toNode ? toNode.get() : null),
          direction: this.direction(),
          getProperty: function() { return properties[key]; },
          getProperties: function() { return properties; },
          getKeys: function() { return properties.getKeys(); },
          getType: function() { return relationshipType; }
        });
      };
      this.toString = function() {
        let direction = "none";
        if(this.leftDirection()) {
          direction = "left";
        } else if(this.rightDirection()) {
          direction = "right";
        }
        return "id: " + id +
          ". type: " + relationshipType +
          ". properties: " + JSON.stringify(properties) +
          ". fromNodeId: " + (fromNode ? fromNode.id() : null) +
          ". toNodeId: " + (toNode ? toNode.id() : null) +
          ". direction: " + direction;
      };
      this.value = function() {
        return this.get();
      };
      this.setVariableKey = function(_variableKey) {
        variableKey = _variableKey;
      };
      this.getVariableKey = function() {
        return variableKey;
      };
      this.hasVariableKey = function() {
        return variableKey != undefined;
      };
      this.nextAction = function() {
        ;
      };
      this.setNextAction = function(f) {
        this.nextAction = f;
      };

      let matchedRelationship;

      let expandedPath = [];
      let pathList = [];
      let visitedNodes = {};

      let matchingRelationshipsIds;
      let expandedEndNode = null;

      const updateVisitedNodes = function(nodeId) {
        visitedNodes[nodeId] = (visitedNodes[nodeId] || 0) + 1;
      };
      const updateVisitedRelationships = function(path) {
        if(expandedPath.length == 0) {
          updateVisitedNodes(path.fromNodeId);
        }
        updateVisitedNodes(path.toNodeId);
      };
      this.visitedBefore = function(nodeId) {
        if(expandedPath.length > 1) {
          if(expandedPath[expandedPath.length-1] == expandedPath[expandedPath.length-2]) {
            return true;
          }
        }
        return visitedNodes[nodeId] >= 2;
      };
      this.setMatchedRelationship = function(relationship) {
        matchedRelationship = relationship.id();
      };
      this.addMatchedRelationship = function(relationship, path) {
        if(hasVariablePathLength) {
          expandedPath.push(relationship.id());
          pathList.push(path);
          updateVisitedRelationships(path);
        } else if(!hasVariablePathLength) {
          this.setMatchedRelationship(relationship);
        }
      };
      this.getMatchedRelationship = function() {
        return this.getData();
      };
      this.hasExpandedEndNode = function() {
        return expandedEndNode != null;
      };
      this.setExpandedEndNode = function(_expandedEndNode) {
        expandedEndNode = _expandedEndNode;
      };
      this.getExpandedEndNode = function() {
        return expandedEndNode;
      };
      this.setMatchingRelationshipIds = function(relationshipIds) {
        matchingRelationshipsIds = relationshipIds;
      };
      this.getMatchingRelationshipIds = function() {
        let matchingRelationshipsIdsToReturn = null;
        if(matchingRelationshipsIds) {
          matchingRelationshipsIdsToReturn =
            matchingRelationshipsIds.slice();
        }
        matchingRelationshipsIds = null;
        return matchingRelationshipsIdsToReturn;
      };
      this.expandedPathLastItem = function() {
        return expandedPath[expandedPath.length-1];
      };
      this.backTrackExpandedPath = function() {
        if(expandedPath.length == 0) {
          return;
        }
        expandedPath.pop();
        const path = pathList.pop();
        if(expandedPath.length == 0) {
          visitedNodes = {};
        } else {
          visitedNodes[path.toNodeId]--;
        }
      };
      this.resetExpandedPath = function() {
        expandedPath = [];
        pathList = [];
        visitedNodes = {};
      };
      this.pathLengthFromSatisfied = function() {
        return !this.expandPath() || (pathLengthFrom == null) || (pathLengthFrom && expandedPath.length >= pathLengthFrom);
      };
      this.pathLengthToSatisfied = function() {
        return !this.expandPath() || (pathLengthTo == null) || (pathLengthTo && expandedPath.length <= pathLengthTo);
      };
      this.pathLengthSatisfied = function() {
        return this.pathLengthFromSatisfied() && this.pathLengthToSatisfied();
      };

      this.getExpandedPath = function() {
        return expandedPath;
      };

      this.setShortestPath = function(shortestPath) {
        expandedPath = shortestPath;
      };

      this.getData = function() {
        if(hasVariablePathLength) {
          //return new List(expandedPath.toArray());
          return new List(
            expandedPath,
            (function(relationshipId) {
              return db.getRelationshipById(relationshipId).value();
            })
          );
        }
        return db.getRelationshipById(matchedRelationship);
      };
      this.getLocalProperty = function(key) {
        return properties[key] || null;
      };
      this.getProperty = function(key) {
        if(!db.getRelationshipById(matchedRelationship)) return null;
        return db.getRelationshipById(matchedRelationship).getLocalProperty(key);
      };
      this.groupByKey = function() {
        return this.getData().id();
      };
      this.groupByValue = function() {
        return this.getData().get();
      };

      this.copy = function() {
        const r = new Relationship(db);
        r.setType(relationshipType);
        r.setProperties(properties);
        r.setLeftDirection(leftDirection);
        r.setRightDirection(rightDirection);
        r.setFromNode(fromNode);
        r.setToNode(toNode);
        return r;
      };

      this.mappable = function() {
        if(referredRelationship) {
          if(referredRelationship.mappable && !referredRelationship.mappable()) {
            return false;
          }
        }
        for(const propertyKey in properties) {
          if(!propertyExpressions[propertyKey].mappable()) {
            return false;
          }
        }
        return true;
      };

    };

    function Pattern() {
      const objects = [];
      const nodes = [];
      const relationships = [];
      const me = this;

      let usedAsCondition = false;
      let findShortestPath = false;
      let shortestPathLength = Number.MAX_SAFE_INTEGER;
      let shortestPath;

      const addObject = function(object) {
        if(!me.empty()) {
          me.lastObject().setNextObject(object);
          object.setPreviousObject(me.lastObject());
        }
        object.setPattern(me);
        objects.push(object);
      };
      const processShortestPath = function() {
        if(relationships[0].getExpandedPath().length < shortestPathLength) {
          shortestPathLength = relationships[0].getExpandedPath().length;
          shortestPath = relationships[0].getExpandedPath().slice();
        }
      };
      this.shortestpath = function() {
        findShortestPath = true;
      };
      this.addNode = function(node) {
        nodes.push(node);
        addObject(node);
      };
      this.addRelationship = function(relationship) {
        relationships.push(relationship);
        addObject(relationship);
      };

      this.nodeCount = function() {
        return this.nodes.length;
      };
      this.relationshipCount = function() {
        return this.relationships.length;
      };

      this.getData = function() {
        let d = []
        let r, relationshipList;
        const groupByKey = [];
        for(let i=0; i<relationships.length; i++) {
          if(!relationships[i].hasVariablePathLength()) {
            r = relationships[i].getData().value().getRelationship();
            d.push(
              r.getFromNode().get(),
              r.get(),
              r.getToNode().get()
            );
            groupByKey.push(r.id());
          } else if(relationships[i].hasVariablePathLength()) {
            relationshipList = relationships[i].getData().value();
            for(let j=0; j<relationshipList.length; j++) {
              r = relationshipList[j].getRelationship();
              d.push(
                r.getFromNode().get(),
                r.get(),
                r.getToNode().get()
              );
              groupByKey.push(r.id());
            }
          }
        }
        d = addArrayFunctions(d);
        d.getNodes = function() {
          const nodes = [];
          for(let i=0; i<d.length; i+=3) {
            if(i==0) {
              nodes.push(d[i]);
            }
            nodes.push(d[i+2]);
          }
          return addArrayFunctions(nodes);
        };
        d.getRelationships = function() {
          const relationships = [];
          for(let i=0; i<d.length; i+=3) {
            relationships.push(d[i+1]);
          }
          return addArrayFunctions(relationships);
        };
        this.groupByKey = function() { return groupByKey; };
        this.groupByValue = function() { return d; };
        return d;
      };
      this.objects = function() {
        return objects;
      };
      this.getObject = function(index) {
        return objects[index];
      };
      this.lastObject = function() {
        return objects[objects.length-1];
      };
      this.getLast = this.lastObject;
      this.empty = function() {
        return objects.length == 0;
      };
      this.setNextAction = function(f) {
        nextAction = f;
      };
      let nextAction = function() {
        ;
      };
      this.finish = function() {
        if(findShortestPath) {
          relationships[0].setShortestPath(shortestPath);
          nextAction();
        }
      };
      const initialiseConveyorBelt = function() {
        me.lastObject().setNextAction(
          function() {
            if(!findShortestPath) {
              nextAction();
            } else if(findShortestPath) {
              processShortestPath();
            }
          }
        );
      };
      this.useAsCondition = function() {
        usedAsCondition = true;
        me.lastObject().setNextAction(
          function() {
            return true;
          }
        );
      };
      this.usedAsCondition = function() {
        return usedAsCondition;
      };
      this.value = function() {
        return nodes[0].convey(false);
      };
      this.match = function() {
        initialiseConveyorBelt();
        nodes[0].convey(false); // match: merge == false
      };
      this.merge = function() {
        initialiseConveyorBelt();
        nodes[0].convey(true); // merge: merge == true
      };
      this.create = function() {
        initialiseConveyorBelt();
        nodes[0].create();
      };

      this.mappable = function() {
        for(let i=0; i<objects.length; i++) {
          if(!objects[i].mappable()) {
            return false;
          }
        }
        return true;
      }
    };

    function AssociativeArray() {
      const associativeArray = {};
      const boundAssociativeArray = {};
      const keys = [];
      const me = this;
      const bind = function() {
        for(const key in associativeArray) {
          boundAssociativeArray[key] =
            associativeArray[key].value();
        }
      };
      this.addEntry = function(key, element) {
        if(key in associativeArray) {
          throw "Key \"" + key + "\" already exists in associative array.";
        }
        associativeArray[key] = element;
        boundAssociativeArray[key] = null;
        keys.push(key);
      };
      this.get = function() {
        bind();
        const boundAssociativeArrayCopy = {};
        for(const key in boundAssociativeArray) {
          boundAssociativeArrayCopy[key] = boundAssociativeArray[key];
          //JSON.parse(JSON.stringify(boundAssociativeArray[key]));
          if(boundAssociativeArrayCopy[key]) {
            boundAssociativeArrayCopy[key].constructor =
              boundAssociativeArray[key].constructor;
          }
        }
        return addAssociativeArrayFunctions(
          boundAssociativeArrayCopy
        );
      };
      this.getProperty = function(key) {
        bind();
        return boundAssociativeArray[key];
      };
      this.getProperties = function() {
        return Object.keys(associativeArray);
      };
      this.getValues = function() {
        return Object.values(associativeArray);
      };
      this.setValue = function(index, element) {
        associativeArray[keys[index]] = element;
      };
      this.next = function() {
        return false;
      };
      this.hasNext = function() {
        return true;
      };
      this.reset = function() {
        ;
      };
      this.getData = function() {
        return me;
      };
      this.getObject = function() {
        return me;
      };
      this.value = function() {
        return me.get();
      };
      this.type = function() {
        return me.constructor.name;
      };
      this.toString = function() {
        bind();
        return JSON.stringify(boundAssociativeArray);
      };
      this.groupByKey = function() {
        return me.toString();
      };
      this.groupByValue = function() {
        return me.get();
      };
    };

    function List(list_, bindFunction) {
      const list = (list_ && (list_.constructor == Array) && list_) || [];
      const boundList = addArrayFunctions([]);
      const me = this;
      const bind = function() {
        if(!bindFunction) {
          for(let i=0; i<list.length; i++) {
            boundList[i] = list[i].value();
          }
        } else if(bindFunction) {
          for(let i=0; i<list.length; i++) {
            boundList[i] = bindFunction(list[i]);
          }
        }
      };
      this.add = function(expression) {
        if(!expression) {
          return;
        }
        list.push(expression);
        boundList.push(null);
      };
      this.get = function() {
        bind();
        const boundListCopy = new Array(boundList.length);
        for(let i=0; i<boundList.length; i++) {
          if(boundList[i].constructor == NodeReference ||
            boundList[i].constructor == RelationshipReference) {
            boundListCopy[i] = boundList[i];
            continue;
          }
          //boundListCopy[i] = JSON.parse(JSON.stringify(boundList[i]));
          boundListCopy[i] = boundList[i];
          boundListCopy[i].constructor = boundList[i].constructor;
          for(const key in boundList[i]) {
            if(boundListCopy[i][key]) {
              boundListCopy[i][key].constructor =
                boundList[i][key].constructor;
            }
          }
        }
        return addArrayFunctions(boundListCopy);
      };
      this.setElement = function(elementIndex, element) {
        list[elementIndex] = element;
      };
      this.getElements = function() {
        return list;
      };
      this.next = function() {
        return false;
      };
      this.hasNext = function() {
        return true;
      };
      this.reset = function() {
        ;
      };
      this.getData = function() {
        return me;
      };
      this.value = function() {
        return me.get();
      };
      this.type = function() {
        return me.constructor.name;
      };
      this.groupByKey = function() {
        return me.get();
      };
      this.groupByValue = function() {
        return me.get();
      };
    };

    function Case() {
      const me = this;
      const whens = [];
      const thens = [];
      let _else;
      this.when = function(expression) {
        whens.push(expression);
      };
      this.whenCount = function() {
        return whens.length;
      };
      this.then = function(expression) {
        thens.push(expression);
      };
      this.else = function(expression) {
        _else = expression;
      };
      this.get = function() {
        return this.value();
      };
      this.next = function() {
        return false;
      };
      this.hasNext = function() {
        return true;
      };
      this.reset = function() {
        ;
      };
      this.getData = function() {
        return me;
      };
      this.value = function() {
        for(let i=0; i<whens.length; i++) {
          if(whens[i].value()) {
            return thens[i].value();
          }
        }
        return _else.value();
      };
      this.type = function() {
        return me.constructor.name;
      };
      this.groupByKey = function() {
        return me.get();
      };
      this.groupByValue = function() {
        return me.get();
      };
    };

    function Constant(_value) {
      let value = _value;
      this.get = function() {
        return value;
      };
      this.next = function() {
        return false;
      };
      this.hasNext = function() {
        return true;
      };
      this.reset = function() {
        ;
      };
      this.getData = function() {
        return this;
      };
      this.getObject = function() {
        return value;
      };
      this.value = function() {
        return value;
      };
      this.id = function() {
        return value.id;
      };
      this.setValue = function(_value) {
        value = _value;
      };
      this.type = function() {
        return this.constructor.name;
      };
      this.groupByKey = function() {
        return value;
      };
      this.groupByValue = function() {
        return value;
      };
    };

    function Table(_db, _tableName) {
      const me = this;
      const db = _db;
      const tableName = _tableName;
      const tableColumns = {};

      this.addColumn = function(columnName) {
        tableColumns[columnName] = new TableColumn(this, columnName);
        return tableColumns[columnName];
      };
      this.addValue = function(columnName, value) {
        tableColumns[columnName].addValue(value);
      };
      this.getColumn = function(columnName) {
        return tableColumns[columnName];
      };
      this.name = function() {
        return tableName;
      };

      init: {
        db.addTable(me);
      };
    };

    function TableColumn(_table, _columnName) {
      const table = _table;
      const columnName = _columnName;
      const runLengths = [];
      const values = [];
      let valueIndex = 0;
      let runLengthIndex = 0;
      this.addValue = function(value) {
        if(values.length > 0) {
          if(values[values.length-1] == value) {
            runLengths[runLengths.length-1]++;
          } else if(values[values.length-1] != value) {
            values.push(value);
            runLengths.push(1);
          }
        } else if(values.length == 0) {
          values.push(value);
          runLengths.push(1);
        }
      };
      this.value = function() {
        if(runLengthIndex > runLengths[valueIndex]) {
          runLengthIndex = 0;
          valueIndex++;
        }
        runLengthIndex++;
        return values[valueIndex];
      }
      this.reset = function() {
        valueIndex = 0;
        runLengthIndex = 0;
      };
      this.name = function() {
        return columnName;
      };
    }
  };

  Utils: {

    // Call like: printStackTrace(arguments.callee);
    function printStackTrace(f) {
      let c = f;
      const o = '';
      try {
        while(c) {
          console.log(c);
          c = c.caller;
        }
      } catch(e) {
        ;
      }
    };

    function getUNIXTimestamp() {
      return (new Date()).valueOf();
    };

    function addArrayFunctions(array) {
      array.contains = function(value) {
        for(let i=0; i<array.length; i++) {
          if(value == array[i]) return true;
        }
        return false;
      };
      array.toLowerCase = function() {
        const a = [];
        for(let i=0; i<array.length; i++) {
          a.push(array[i].toLowerCase && array[i].toLowerCase() || array[i]);
        }
        return a;
      };
      array.toUpperCase = function() {
        const a = [];
        for(let i=0; i<array.length; i++) {
          a.push(array[i].toUpperCase && array[i].toUpperCase() || array[i]);
        }
        return a;
      };
      array.get = function() {
        return array;
      };
      array.last = function() {
        return array[array.length-1];
      };
      array.beforeLast = function() {
        return array[array.length-2];
      };
      array.value = function() {
        return array;
      };
      array.join = function(joinBy) {
        let joined = '';
        for(let i=0; i<array.length; i++) {
          joined += (i>0 ? joinBy : '') + array[i];
        }
        return joined;
      };
      array.trim = function() {
        const trimmedElements = new Array(array.length);
        for(let i=0; i<array.length; i++) {
          trimmedElements[i] = array[i].trim();
        }
        return trimmedElements;
      };
      return array;
    };

    function addAssociativeArrayFunctions(associativeArray) {
      if(!associativeArray.getProperty) {
        associativeArray.getProperty = function(key) {
          return associativeArray[key];
        };
      }
      if(!associativeArray.getProperties) {
        associativeArray.getProperties = function() {
          return associativeArray;
        };
      }
      if(!associativeArray.getKeys) {
        associativeArray.getKeys = function() {
          const props = [];
          for(let key in associativeArray) {
            if(associativeArray[key].constructor !== Function) {
              props.push(key);
            }
          }
          return props;
        }
      }
      return associativeArray;
    };

    function clean(o) {
      if(o && o.constructor == String) {
        // Remove null characters from Unicode strings
        return o.replace(/\0/g, '');
      }
      if(o && (o.constructor == NodeReference || o.constructor == RelationshipReference)) {
        return clean(o.value());
      }
      if(o) {
        for(const p in o) {
          if(typeof o[p] === "function") {
            delete o[p];
            continue;
          }
          if(o[p]) {
            o[p] = clean(o[p]);
          }
        }
        o.fromNode && (o.fromNode = clean(o.fromNode));
        o.toNode && (o.toNode = clean(o.toNode));
      }
      return o;
    };

    function NodeReference(_db, _nodeId) {
      const db = _db;
      const nodeId = _nodeId;
      this.nodeId = function() {
        return nodeId;
      };
      this.id = this.nodeId;
      this.getNode = function() {
        return db.getNodeById(nodeId);
      };
      this.getObject = function() {
        return db.getNodeById(nodeId);
      };
      this.value = function() {
        return db.getNodeById(nodeId).toObject();
      };
      this.getData = this.value;
      this.getProperty = function(propertyKey) {
        return db.getNodeById(nodeId).getLocalProperty(propertyKey);
      };
      this.getProperties = function() {
        return this.value().getProperties();
      };
      this.getLabels = function() {
        return this.value().getLabels();
      };
      this.getKeys = function() {
        return this.value().getProperties().getKeys();
      };
      this.groupByKey = this.nodeId;
    };

    function RelationshipReference(_db, _relationshipId) {
      const db = _db;
      const relationshipId = _relationshipId;
      this.relationshipId = function() {
        return relationshipId;
      };
      this.id = this.relationshipId;
      this.getRelationship = function() {
        return db.getRelationshipById(relationshipId);
      };
      this.getObject = function() {
        return db.getRelationshipById(relationshipId);
      };
      this.value = function() {
        return db.getRelationshipById(relationshipId).toObject();
      };
      this.startNode = function() {
        return this.getRelationship().getFromNode().get();
      };
      this.endNode = function() {
        return this.getRelationship().getToNode().get();
      };
      this.getData = this.value;
      this.getProperty = function(propertyKey) {
        return db.getRelationshipById(relationshipId).getLocalProperty(propertyKey);
      };
      this.getProperties = function() {
        return this.value().getProperties();
      };
      this.getKeys = function() {
        return this.value().getProperties().getKeys();
      };
      this.getType = function() {
        return this.value().getType();
      };
      this.groupByKey = this.relationshipId;
    };

  };

  let db = new DB(this);

  this.addGraph = function(nodes, edges) {
    for(let i=0; i<nodes.length; i++) {
      db.addNode(nodes[i]);
    }
    for(let i=0; i<edges.length; i++) {
      db.addRelationship(edges[i]);
    }
  };

  this.resetDataBase = function() {
    db = new DB(this);
  };

  this.db = function() {
    return db;
  };




}

module.exports = { CypherJS: CypherJS };
