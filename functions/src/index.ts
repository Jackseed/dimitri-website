/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable import/no-duplicates */
/* eslint-disable object-curly-spacing */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { EventContext, Change } from 'firebase-functions';
import * as firebase from 'firebase-admin';
const db = admin.firestore();

// On image writes, sets a position.
export const positioningFunction = functions.firestore
  .document('projects/{projectId}/images/{imageId}')
  .onWrite(
    async (
      change: Change<firebase.firestore.DocumentSnapshot>,
      context: EventContext
    ) => {
      const projectId: string = context.params.projectId;
      const imageId: string = context.params.imageId;

      const projectRef: firebase.firestore.DocumentReference = db
        .collection('projects')
        .doc(projectId);
      if (change.before.exists) return;

      // Saves image position & updates project image count.
      return db.runTransaction(
        async (transaction: firebase.firestore.Transaction) => {
          let position;

          const imageRef = projectRef.collection('images').doc(imageId);
          const img = (await imageRef.get()).data();
          // If it's a vignette, gets current position in _meta doc
          if (img?.type === 'vignette') {
            const metaRef: firebase.firestore.DocumentReference = db
              .collection('projects')
              .doc('_meta');
            const meta = (await transaction.get(metaRef)).data();
            position = meta?.totalVignettes;
            transaction.update(metaRef, {
              totalVignettes: position + 1,
            });
          } else {
            const project = (await transaction.get(projectRef)).data();
            position = project?.imageCount;

            transaction.update(projectRef, {
              imageCount: position + 1,
            });
          }

          if (!position) {
            position = 0;
          }

          transaction.set(
            imageRef,
            {
              position,
            },
            { merge: true }
          );
        }
      );
    }
  );
